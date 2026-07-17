"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush } from "recharts";
import { metrics, type MetricKey, type MetricDefinition } from "@/lib/metrics";
import type { AppSettings, HealthRecord } from "@/lib/types";
import { EmptyState, Panel, Select } from "@/components/ui";
import { HealthInsight, generateInsights } from "@/core/analytics/insights";
import { summarizeMetric, MetricSummary } from "@/core/analytics/engine";
import { ChartSyncProvider, useChartSync } from "@/components/charts/ChartSyncProvider";

interface TrendsWorkbenchProps {
  initialMetricKey: MetricKey;
  initialRange: string;
  showMovingAverage: boolean;
  showGoal: boolean;
  isComparing: boolean;
  chartData: any[];
  records: HealthRecord[];
  summary: MetricSummary;
  prevSummary?: MetricSummary;
  insights: HealthInsight[];
  settings: AppSettings;
}

export function TrendsWorkbench(props: TrendsWorkbenchProps) {
  return (
    <ChartSyncProvider>
      <TrendsWorkbenchContent {...props} />
    </ChartSyncProvider>
  );
}

function TrendsWorkbenchContent({
  initialMetricKey,
  initialRange,
  showMovingAverage,
  showGoal,
  isComparing,
  chartData,
  records,
  summary,
  prevSummary,
  insights,
  settings,
}: TrendsWorkbenchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extract shared interaction state from sync context
  const { hoveredIndex, setHoveredIndex, setHoveredX, brushIndices, setBrushIndices } = useChartSync();

  const metric = metrics.find((m) => m.key === initialMetricKey)!;

  // 1. Client-side recomputation based on active brush index windows
  let activeChartData = chartData;
  let activeSummary = summary;
  let activePrevSummary = prevSummary;
  let activeInsights = insights;

  if (brushIndices && chartData.length > 0) {
    const startIdx = Math.max(0, Math.min(brushIndices[0], chartData.length - 1));
    const endIdx = Math.max(0, Math.min(brushIndices[1], chartData.length - 1));
    
    activeChartData = chartData.slice(startIdx, endIdx + 1);

    if (activeChartData.length > 0) {
      if (isComparing) {
        const currentStart = activeChartData[0]?.currentDate;
        const currentEnd = activeChartData[activeChartData.length - 1]?.currentDate;
        const prevStart = activeChartData[0]?.previousDate;
        const prevEnd = activeChartData[activeChartData.length - 1]?.previousDate;

        const currentVisible = records.filter((r) => r.date >= currentStart && r.date <= currentEnd);
        const prevVisible = records.filter((r) => r.date >= prevStart && r.date <= prevEnd);

        activeSummary = summarizeMetric(currentVisible, metric.key);
        activePrevSummary = summarizeMetric(prevVisible, metric.key);
      } else {
        const start = activeChartData[0]?.date;
        const end = activeChartData[activeChartData.length - 1]?.date;

        const visible = records.filter((r) => r.date >= start && r.date <= end);
        activeSummary = summarizeMetric(visible, metric.key);
        
        // Re-evaluate insights on the fly for the selected window
        const raw = generateInsights(visible, settings, {}, end ? new Date(end) : new Date());
        activeInsights = raw.filter((insight) => insight.supportingMetrics.includes(metric.key));
      }
    }
  }

  const updateFilters = (updates: Record<string, string | boolean>) => {
    // Reset brush selection when filters or metrics change
    setBrushIndices(null);
    
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === false || val === "" || val === "false") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
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
        <p className="text-sm text-[rgb(var(--muted))]">Health Analytics Workbench</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Trends Explorer</h1>
      </header>

      {/* Control Panel */}
      <Panel className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5 block">Metric</label>
            <Select 
              value={initialMetricKey} 
              onChange={(e) => updateFilters({ metric: e.target.value })}
              disabled={isPending}
            >
              {metrics.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5 block">Range</label>
            <div className="grid grid-cols-6 border border-[rgb(var(--border))] rounded-md overflow-hidden bg-[rgb(var(--panel))]">
              {["7D", "30D", "90D", "6M", "1Y", "All"].map((r) => (
                <button 
                  className={`min-h-10 text-xs font-semibold transition-colors border-r border-[rgb(var(--border))] last:border-r-0 ${
                    initialRange === r 
                      ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]" 
                      : "hover:bg-[rgb(var(--panel-soft))]"
                  }`} 
                  key={r} 
                  onClick={() => updateFilters({ range: r })}
                  disabled={isPending}
                  type="button"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 md:col-span-1 md:pl-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1.5 block">Overlays & Tools</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[rgb(var(--text))] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showMovingAverage}
                    onChange={(e) => updateFilters({ ma: e.target.checked })}
                    disabled={isPending}
                    className="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]"
                  />
                  MA (7d)
                </label>
                {["weightKg", "bodyFatPercent"].includes(initialMetricKey) && (
                  <label className="flex items-center gap-2 text-sm text-[rgb(var(--text))] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showGoal}
                      onChange={(e) => updateFilters({ goal: e.target.checked })}
                      disabled={isPending}
                      className="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]"
                    />
                    Goals
                  </label>
                )}
                {initialRange !== "All" && (
                  <label className="flex items-center gap-2 text-sm text-[rgb(var(--text))] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isComparing}
                      onChange={(e) => updateFilters({ compare: e.target.checked })}
                      disabled={isPending}
                      className="rounded border-[rgb(var(--border))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]"
                    />
                    Compare
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Chart Workbench */}
      <Panel className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">{metric.label} {isComparing ? "Period Comparison" : "Timeline"}</h2>
            {brushIndices && (
              <button
                onClick={() => setBrushIndices(null)}
                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[rgb(var(--border))] hover:bg-[rgb(var(--panel-soft))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] rounded-md transition-colors focus-ring"
                type="button"
              >
                Reset Window
              </button>
            )}
          </div>
          <span className="text-sm text-[rgb(var(--muted))]" suppressHydrationWarning>
            {activeSummary.count} logs {isComparing && activePrevSummary ? `(vs ${activePrevSummary.count} previous)` : ""}
          </span>
        </div>
        
        {chartData.length ? (
          <div className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 12, right: 20, bottom: 8, left: 0 }}
                syncId="trendsGroup"
                onMouseMove={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setHoveredIndex(state.activeTooltipIndex);
                    if (state.activeLabel) {
                      setHoveredX(state.activeLabel);
                    }
                  }
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setHoveredX(null);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.3)" />
                {isComparing ? (
                  <XAxis dataKey="index" label={{ value: "Days in Period", position: "insideBottom", offset: -5, fontSize: 10 }} tickLine={false} axisLine={false} fontSize={12} />
                ) : (
                  <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} fontSize={12} />
                )}
                <YAxis tickLine={false} axisLine={false} width={48} fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                
                <Tooltip content={<CustomSyncedTooltip metric={metric} />} />

                {/* Goal Reference Lines */}
                {showGoal && initialMetricKey === "weightKg" && settings.targetWeightKg ? (
                  <ReferenceLine y={settings.targetWeightKg} stroke="rgb(var(--warn))" strokeDasharray="4 4" label={{ value: "Weight Target", fontSize: 10, fill: "rgb(var(--warn))" }} />
                ) : null}
                {showGoal && initialMetricKey === "bodyFatPercent" && settings.targetBodyFatPercent ? (
                  <ReferenceLine y={settings.targetBodyFatPercent} stroke="rgb(var(--warn))" strokeDasharray="4 4" label={{ value: "Fat Target", fontSize: 10, fill: "rgb(var(--warn))" }} />
                ) : null}

                {/* Primary current period line */}
                <Line 
                  type="monotone" 
                  dataKey="currentValue" 
                  stroke={metric.color} 
                  strokeWidth={2} 
                  name="currentValue"
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }} 
                />

                {/* Optional moving average line */}
                {showMovingAverage && !isComparing && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    stroke="rgb(var(--warn))" 
                    strokeWidth={1.5} 
                    dot={false}
                    name="movingAverage"
                  />
                )}

                {/* Optional comparative period line */}
                {isComparing && (
                  <Line 
                    type="monotone" 
                    dataKey="previousValue" 
                    stroke="rgb(var(--muted))" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    name="previousValue"
                    dot={{ r: 2 }} 
                  />
                )}

                {/* Timebrush window controller */}
                <Brush 
                  dataKey={isComparing ? "index" : "date"} 
                  height={28} 
                  stroke="rgba(var(--accent), 0.5)"
                  fill="rgb(var(--panel))"
                  tickFormatter={() => ""}
                  onChange={(range) => {
                    if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
                      setBrushIndices([range.startIndex, range.endIndex]);
                    }
                  }}
                  startIndex={brushIndices ? brushIndices[0] : undefined}
                  endIndex={brushIndices ? brushIndices[1] : undefined}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No records in this range" body="Choose a wider range or log a new measurement." />
        )}
      </Panel>

      {/* Statistics Workbench Panels */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard 
          label="Latest value" 
          value={fmt(activeSummary.latest, metric)} 
          prevValue={isComparing && activePrevSummary ? fmt(activePrevSummary.latest, metric) : undefined}
        />
        <StatCard 
          label="Period change" 
          value={fmt(activeSummary.absoluteChange, metric, true)} 
          prevValue={isComparing && activePrevSummary ? fmt(activePrevSummary.absoluteChange, metric, true) : undefined}
        />
        <StatCard 
          label="Period average" 
          value={fmt(activeSummary.mean, metric)} 
          prevValue={isComparing && activePrevSummary ? fmt(activePrevSummary.mean, metric) : undefined}
        />
        <StatCard 
          label="Standard deviation" 
          value={activeSummary.standardDeviation !== undefined ? `${activeSummary.standardDeviation.toFixed(2)} ${metric.unit}` : "—"} 
          prevValue={isComparing && activePrevSummary && activePrevSummary.standardDeviation !== undefined ? `${activePrevSummary.standardDeviation.toFixed(2)} ${metric.unit}` : undefined}
        />
      </div>

      {/* Active Metric Insights observations */}
      {activeInsights.length > 0 && (
        <div className="grid gap-3 mt-2">
          <h3 className="font-semibold text-xs text-[rgb(var(--muted))] uppercase tracking-wider">Observations</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {activeInsights.map((insight) => (
              <Panel key={insight.id} className="p-4 border border-[rgb(var(--border))]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[rgb(var(--muted))]">
                  {insight.category}
                </span>
                <h4 className="font-semibold text-sm mt-1">{insight.title}</h4>
                <p className="text-xs text-[rgb(var(--muted))] mt-1 leading-relaxed">{insight.description}</p>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomSyncedTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload || !payload.length) return null;

  const currentValue = payload.find((p: any) => p.dataKey === "currentValue")?.value;
  const previousValue = payload.find((p: any) => p.dataKey === "previousValue")?.value;
  const movingAverage = payload.find((p: any) => p.dataKey === "movingAverage")?.value;

  const dateLabel = payload[0]?.payload?.date || `Day ${label}`;

  return (
    <div className="p-3 shadow-md border border-[rgb(var(--border))] text-xs rounded-md bg-[rgb(var(--panel))] max-w-[220px]">
      <div className="font-semibold text-[rgb(var(--muted))] mb-1.5">{dateLabel}</div>
      <div className="grid gap-1">
        {currentValue !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="font-medium text-[rgb(var(--text))]">Current:</span>
            <span className="font-bold text-[rgb(var(--accent))]">
              {currentValue.toFixed(metric.precision)} {metric.unit}
            </span>
          </div>
        )}
        {previousValue !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="font-medium text-[rgb(var(--muted))]">Previous:</span>
            <span className="font-bold text-[rgb(var(--muted))]">
              {previousValue.toFixed(metric.precision)} {metric.unit}
            </span>
          </div>
        )}
        {movingAverage !== undefined && (
          <div className="flex justify-between gap-4 border-t border-[rgb(var(--border))] pt-1 mt-1">
            <span className="font-medium text-[rgb(var(--warn))]">MA (7d):</span>
            <span className="font-semibold text-[rgb(var(--warn))]">
              {movingAverage.toFixed(metric.precision)} {metric.unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  prevValue?: string;
}

function StatCard({ label, value, prevValue }: StatCardProps) {
  return (
    <Panel className="p-4 flex flex-col justify-between">
      <div className="text-xs text-[rgb(var(--muted))] uppercase tracking-wider font-semibold">{label}</div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="num text-xl font-semibold">{value}</div>
        {prevValue && (
          <div className="text-xs text-[rgb(var(--muted))] italic font-medium">
            prev: {prevValue}
          </div>
        )}
      </div>
    </Panel>
  );
}
