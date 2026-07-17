import { MetricKey, metrics, valueFor } from "@/lib/metrics";
import { HealthRecord, AppSettings } from "@/lib/types";
import { parseISO, differenceInCalendarDays } from "date-fns";
import * as stats from "./statistics";

export type MetricSummary = {
  metricKey: MetricKey;
  count: number;
  latest?: number;
  first?: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  standardDeviation?: number;
  absoluteChange?: number;
  percentageChange?: number;
  trend: stats.TrendDirection;
};

export type GoalProgressSummary = {
  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  remainingWeight: number;
  percentComplete?: number;
};

export type TimeSeriesPoint = {
  date: string;
  value: number;
};

/**
 * Extracts a chronological series of numeric values for a specific metric key.
 * Traverses matching records, filters by date range boundaries, and sorts ascending.
 */
export function extractTimeSeries(
  records: HealthRecord[],
  key: MetricKey,
  from?: Date,
  to?: Date
): TimeSeriesPoint[] {
  const definition = metrics.find((m) => m.key === key);
  if (!definition) return [];

  return records
    .filter((r) => r.kind === definition.kind)
    .map((r) => {
      const val = valueFor(r, key);
      return {
        date: r.date,
        timestamp: r.timestamp,
        value: val,
      };
    })
    .filter((point): point is { date: string; timestamp: string; value: number } => {
      if (point.value === undefined || point.value === null) return false;
      const parsedDate = parseISO(point.timestamp);
      if (from && parsedDate < from) return false;
      if (to && parsedDate > to) return false;
      return true;
    })
    // Sort chronologically ascending (first record to last record)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((p) => ({ date: p.date, value: p.value }));
}

/**
 * Summarizes a specific metric key from a dataset.
 */
export function summarizeMetric(
  records: HealthRecord[],
  key: MetricKey,
  from?: Date,
  to?: Date
): MetricSummary {
  const series = extractTimeSeries(records, key, from, to);
  const values = series.map((p) => p.value);

  const count = stats.count(values);
  const first = values[0];
  const latest = values[values.length - 1];

  return {
    metricKey: key,
    count,
    latest,
    first,
    min: stats.minimum(values),
    max: stats.maximum(values),
    mean: stats.mean(values),
    median: stats.median(values),
    standardDeviation: stats.standardDeviation(values),
    absoluteChange: first !== undefined && latest !== undefined ? stats.absoluteChange(first, latest) : undefined,
    percentageChange: first !== undefined && latest !== undefined ? stats.percentageChange(first, latest) : undefined,
    trend: stats.trendDirection(values),
  };
}

/**
 * Summarizes all metrics in the dataset in an optimized single traversal pass
 * by grouping domain records by kind once.
 */
export function summarizeAllMetrics(
  records: HealthRecord[],
  from?: Date,
  to?: Date
): Partial<Record<MetricKey, MetricSummary>> {
  const result: Partial<Record<MetricKey, MetricSummary>> = {};

  // Group records by kind to prevent repeatedly filtering the full array
  const recordsByKind = records.reduce<Record<string, HealthRecord[]>>((acc, r) => {
    if (!acc[r.kind]) acc[r.kind] = [];
    acc[r.kind].push(r);
    return acc;
  }, {});

  for (const m of metrics) {
    const kindRecords = recordsByKind[m.kind] || [];
    result[m.key] = summarizeMetric(kindRecords, m.key, from, to);
  }

  return result;
}

/**
 * Computes progress against the user's weight goal.
 */
export function computeGoalProgress(
  records: HealthRecord[],
  settings: AppSettings
): GoalProgressSummary | undefined {
  const target = settings.targetWeightKg;
  if (target === undefined || target <= 0) return undefined;

  const weights = extractTimeSeries(records, "weightKg");
  if (weights.length === 0) return undefined;

  const current = weights[weights.length - 1].value;

  // Determine the starting point for this goal
  let startPoint = weights[0];
  if (settings.goalStartDate) {
    const targetStartDate = parseISO(settings.goalStartDate);
    const match = weights.find((point) => {
      const parsedDate = parseISO(point.date);
      return differenceInCalendarDays(parsedDate, targetStartDate) >= 0;
    });
    if (match) {
      startPoint = match;
    }
  }

  const start = startPoint.value;
  const remaining = target - current;

  // Calculate percentage completion if we started from a different weight
  let percentComplete: number | undefined = undefined;
  if (start !== target) {
    const totalChangeNeeded = target - start;
    const changeAccomplished = current - start;
    percentComplete = (changeAccomplished / totalChangeNeeded) * 100;
  }

  return {
    currentWeight: current,
    targetWeight: target,
    startWeight: start,
    remainingWeight: remaining,
    percentComplete,
  };
}
