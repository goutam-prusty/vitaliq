"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AppSettings, HealthRecord } from "@/lib/types";
import { Panel, Button } from "@/components/ui";
import { metrics } from "@/lib/metrics";
import { extractTimeSeries, summarizeMetric } from "@/core/analytics/engine";
import { movingAverage } from "@/core/analytics/statistics";
import dynamic from "next/dynamic";

const LineChartWidget = dynamic(
  () => import("@/components/charts/line-chart-widget").then((mod) => mod.LineChartWidget),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[rgb(var(--border))]/20 animate-pulse rounded-lg flex items-center justify-center text-xs text-[rgb(var(--muted))]" aria-label="Loading chart">Loading chart...</div>,
  }
);

const BloodPressureWidget = dynamic(
  () => import("@/components/charts/blood-pressure-widget").then((mod) => mod.BloodPressureWidget),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[rgb(var(--border))]/20 animate-pulse rounded-lg flex items-center justify-center text-xs text-[rgb(var(--muted))]" aria-label="Loading chart">Loading chart...</div>,
  }
);

interface TrendsDashboardProps {
  records: HealthRecord[];
  settings: AppSettings;
  initialRange: string;
}

export function TrendsDashboard({ records, settings, initialRange }: TrendsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateRange = (r: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", r);
    startTransition(() => {
      router.push(`/trends?${params.toString()}`);
    });
  };

  const getMetricData = (key: any) => {
    const series = extractTimeSeries(records, key);
    const summary = summarizeMetric(records, key);
    const metricDef = metrics.find(m => m.key === key)!;
    
    const values = series.map(p => p.value).filter(v => v !== undefined) as number[];
    const ma = movingAverage(values, 7);
    const chartData = series.map((p, i) => ({
      date: p.date,
      [key]: p.value,
      movingAverage: ma[i]
    }));
    
    return { chartData, summary, metricDef };
  };

  const weight = getMetricData("weightKg");
  const bodyFat = getMetricData("bodyFatPercent");
  const bmi = getMetricData("bmi");
  const glucose = getMetricData("glucoseMgDl");
  
  const pressureRecords = records.filter(r => r.kind === "pressure") as any[];
  const bpChartData = pressureRecords.map(r => ({
    date: r.date,
    systolic: r.systolic,
    diastolic: r.diastolic
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const systolicSummary = summarizeMetric(records, "systolic");

  const significantChanges = [
    { label: "Weight", summary: weight.summary, unit: "kg" },
    { label: "Body Fat", summary: bodyFat.summary, unit: "%" },
    { label: "Systolic", summary: systolicSummary, unit: "mmHg" },
  ].filter(s => s.summary && Math.abs(s.summary.absoluteChange || 0) > 0);

  return (
    <div className={`mx-auto grid max-w-7xl gap-6 lg:gap-8 p-4 md:p-8 w-full transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--muted))]">Health Analytics Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Trends & Insights</h1>
        </div>
        
        <div className="grid grid-cols-6 border border-[rgb(var(--border))] rounded-md overflow-hidden bg-[rgb(var(--panel))] shrink-0 max-w-md">
          {["7D", "30D", "90D", "6M", "1Y", "All"].map((r) => (
            <button 
              className={`min-h-10 px-2 text-xs font-semibold transition-colors border-r border-[rgb(var(--border))] last:border-r-0 ${
                initialRange === r ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]" : "hover:bg-[rgb(var(--panel-soft))]"
              }`} 
              key={r} 
              onClick={() => updateRange(r)}
              disabled={isPending}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* What's Changed Summary */}
      {significantChanges.length > 0 && (
        <Panel variant="compact" elevation={1} className="flex flex-wrap gap-8 items-center bg-[rgb(var(--panel-soft))] border-[rgb(var(--border))]">
          <div className="font-semibold text-sm">What's changed?</div>
          {significantChanges.map(change => {
            const isUp = (change.summary.absoluteChange || 0) > 0;
            const TrendIcon = change.summary.trend === "up" ? TrendingUp : change.summary.trend === "down" ? TrendingDown : Minus;
            const color = change.summary.trend === "up" ? "text-[rgb(var(--danger))]" : change.summary.trend === "down" ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]";
            
            return (
              <div key={change.label} className="flex items-center gap-2">
                <span className="text-xs text-[rgb(var(--muted))] uppercase tracking-wider">{change.label}</span>
                <span className={`flex items-center text-sm font-semibold ${color}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  {isUp ? "+" : ""}{(change.summary.absoluteChange || 0).toFixed(1)} {change.unit}
                </span>
              </div>
            );
          })}
        </Panel>
      )}

      {/* Weight Journey */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-[rgb(var(--border))] pb-2 tracking-tight">Weight Journey</h2>
        <Panel elevation={1} className="h-[360px]">
          <LineChartWidget 
            data={weight.chartData} 
            dataKey="weightKg" 
            color={weight.metricDef.color} 
            unit="kg"
            movingAverageDataKey="movingAverage"
            goalValue={settings.targetWeightKg}
          />
        </Panel>
      </section>

      {/* Body Composition */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-[rgb(var(--border))] pb-2 tracking-tight">Body Composition</h2>
        <div className="grid md:grid-cols-2 gap-6 h-[300px]">
          <Panel variant="compact" elevation={1} className="flex flex-col h-[300px]">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-[rgb(var(--muted))]">Body Fat %</div>
            <div className="flex-1 min-h-0">
              <LineChartWidget 
                data={bodyFat.chartData} 
                dataKey="bodyFatPercent" 
                color={bodyFat.metricDef.color} 
                unit="%"
                goalValue={settings.targetBodyFatPercent}
              />
            </div>
          </Panel>
          <Panel variant="compact" elevation={1} className="flex flex-col h-[300px]">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-[rgb(var(--muted))]">BMI</div>
            <div className="flex-1 min-h-0">
              <LineChartWidget 
                data={bmi.chartData} 
                dataKey="bmi" 
                color={bmi.metricDef.color} 
                unit=""
              />
            </div>
          </Panel>
        </div>
      </section>

      {/* Cardiovascular */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-[rgb(var(--border))] pb-2 tracking-tight">Cardiovascular Health</h2>
        <Panel elevation={1} className="h-[320px] flex flex-col">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-[rgb(var(--muted))] flex items-center justify-between">
            <span>Blood Pressure (Systolic / Diastolic)</span>
            <span className="text-[10px] font-semibold px-2 py-1 bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] rounded-md tracking-normal normal-case">Normal Range: 90/60 - 120/80</span>
          </div>
          <div className="flex-1 min-h-0">
            <BloodPressureWidget data={bpChartData} />
          </div>
        </Panel>
      </section>

      {/* Metabolic */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-[rgb(var(--border))] pb-2 tracking-tight">Metabolic Health</h2>
        <Panel elevation={1} className="h-[300px] flex flex-col">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-[rgb(var(--muted))]">Fasting Blood Glucose</div>
          <div className="flex-1 min-h-0">
            <LineChartWidget 
              data={glucose.chartData} 
              dataKey="glucoseMgDl" 
              color={glucose.metricDef.color} 
              unit="mg/dL"
              goalValue={100}
              goalLabel="Pre-diabetic limit"
            />
          </div>
        </Panel>
      </section>

      {/* Advanced Analytics */}
      <div className="pt-8 pb-12 flex justify-center border-t border-[rgb(var(--border))]">
        <Link href="/trends/advanced">
          <Button className="px-6 h-12">
            Open Advanced Analytics <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
