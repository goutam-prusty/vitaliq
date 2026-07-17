"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { metrics, type MetricKey, type MetricDefinition } from "@/lib/metrics";
import type { AppSettings } from "@/lib/types";
import { EmptyState, Panel, Select } from "@/components/ui";

interface InteractiveTrendsProps {
  initialMetricKey: MetricKey;
  initialRange: string;
  data: Array<{ date: string; value: number | undefined }>;
  summary: {
    latest?: number;
    change?: number;
    average?: number;
    min?: number;
    max?: number;
    count: number;
  };
  settings: AppSettings;
}

export function InteractiveTrends({
  initialMetricKey,
  initialRange,
  data,
  summary,
  settings,
}: InteractiveTrendsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const metric = metrics.find((m) => m.key === initialMetricKey)!;

  const updateFilters = (newMetric: string, newRange: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("metric", newMetric);
    params.set("range", newRange);
    startTransition(() => {
      router.push(`/trends?${params.toString()}`);
    });
  };

  const fmt = (value: number | undefined, metricDef: MetricDefinition, signed = false) => {
    if (value === undefined) return "—";
    return `${signed && value > 0 ? "+" : ""}${value.toFixed(metricDef.precision)} ${metricDef.unit}`.trim();
  };

  return (
    <div className={`mx-auto grid max-w-7xl gap-5 p-4 md:p-8 transition-opacity duration-200 ${
      isPending ? "opacity-60" : "opacity-100"
    }`}>
      <header>
        <p className="text-sm text-[rgb(var(--muted))]">Metric explorer</p>
        <h1 className="mt-1 text-2xl font-semibold">Trends</h1>
      </header>
      
      <Panel className="grid gap-3 p-5 md:grid-cols-[minmax(220px,320px)_1fr]">
        <Select 
          value={initialMetricKey} 
          onChange={(e) => updateFilters(e.target.value, initialRange)}
          disabled={isPending}
        >
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-6 border border-[rgb(var(--border))]">
          {["7D", "30D", "90D", "6M", "1Y", "All"].map((r) => (
            <button 
              className={`focus-ring min-h-10 border-r border-[rgb(var(--border))] text-sm last:border-r-0 transition-colors ${
                initialRange === r 
                  ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]" 
                  : "hover:bg-[rgb(var(--panel-soft))]"
              }`} 
              key={r} 
              onClick={() => updateFilters(initialMetricKey, r)}
              disabled={isPending}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">{metric.label}</h2>
          <span className="text-sm text-[rgb(var(--muted))]">{summary.count} measurements</span>
        </div>
        {data.length ? (
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} width={48} fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip 
                  contentStyle={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }} 
                  formatter={(v) => [`${Number(v).toFixed(metric.precision)} ${metric.unit}`, metric.label]} 
                />
                {initialMetricKey === "weightKg" && settings.targetWeightKg ? (
                  <ReferenceLine y={settings.targetWeightKg} stroke="rgb(var(--warn))" strokeDasharray="4 4" />
                ) : null}
                {initialMetricKey === "bodyFatPercent" && settings.targetBodyFatPercent ? (
                  <ReferenceLine y={settings.targetBodyFatPercent} stroke="rgb(var(--warn))" strokeDasharray="4 4" />
                ) : null}
                <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No records in this range" body="Choose a wider range or log a new measurement." />
        )}
      </Panel>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Latest" value={fmt(summary.latest, metric)} />
        <Stat label="Change" value={fmt(summary.change, metric, true)} />
        <Stat label="Average" value={fmt(summary.average, metric)} />
        <Stat label="Range" value={summary.min === undefined ? "—" : `${fmt(summary.min, metric)} to ${fmt(summary.max, metric)}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="p-4">
      <div className="text-sm text-[rgb(var(--muted))]">{label}</div>
      <div className="num mt-2 text-xl font-semibold">{value}</div>
    </Panel>
  );
}
