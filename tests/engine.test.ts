import { describe, expect, it } from "vitest";
import {
  extractTimeSeries,
  summarizeMetric,
  summarizeAllMetrics,
  computeGoalProgress,
} from "../core/analytics/engine";
import { HealthRecord, AppSettings } from "@/lib/types";

describe("core analytics engine", () => {
  const dummySettings: AppSettings = {
    preferredWeightUnit: "kg",
    preferredHeightUnit: "cm",
    preferredGlucoseUnit: "mg/dL",
    timezone: "Asia/Kolkata",
    theme: "system",
  };

  const sampleRecords: HealthRecord[] = [
    {
      id: "1",
      kind: "body",
      date: "2026-03-01",
      time: "08:00",
      timestamp: "2026-03-01T08:00:00Z",
      weightKg: 80,
      notes: "First weight",
    },
    {
      id: "2",
      kind: "body",
      date: "2026-03-05",
      time: "08:00",
      timestamp: "2026-03-05T08:00:00Z",
      weightKg: 79,
    },
    {
      id: "3",
      kind: "body",
      date: "2026-03-10",
      time: "08:00",
      timestamp: "2026-03-10T08:00:00Z",
      weightKg: 78,
    },
    {
      id: "4",
      kind: "pressure",
      date: "2026-03-05",
      time: "09:00",
      timestamp: "2026-03-05T09:00:00Z",
      systolic: 120,
      diastolic: 80,
      category: "Normal",
    },
  ];

  it("extracts chronological time-series", () => {
    const series = extractTimeSeries(sampleRecords, "weightKg");
    expect(series).toHaveLength(3);
    expect(series[0]).toEqual({ date: "2026-03-01", value: 80 });
    expect(series[2]).toEqual({ date: "2026-03-10", value: 78 });
  });

  it("handles empty datasets gracefully", () => {
    const summary = summarizeMetric([], "weightKg");
    expect(summary.count).toBe(0);
    expect(summary.latest).toBeUndefined();
    expect(summary.min).toBeUndefined();
    expect(summary.trend).toBe("flat");
  });

  it("handles single-record datasets", () => {
    const single: HealthRecord[] = [sampleRecords[0]];
    const summary = summarizeMetric(single, "weightKg");
    expect(summary.count).toBe(1);
    expect(summary.latest).toBe(80);
    expect(summary.first).toBe(80);
    expect(summary.absoluteChange).toBe(0);
    expect(summary.trend).toBe("flat");
  });

  it("calculates trend directions accurately", () => {
    const summary = summarizeMetric(sampleRecords, "weightKg");
    expect(summary.trend).toBe("down");

    const increasing: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
      { id: "2", kind: "body", date: "2026-03-10", time: "08:00", timestamp: "2026-03-10T08:00:00Z", weightKg: 82 },
    ];
    const summaryInc = summarizeMetric(increasing, "weightKg");
    expect(summaryInc.trend).toBe("up");
  });

  it("ignores missing values in time-series", () => {
    const mixedRecords: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
      { id: "2", kind: "body", date: "2026-03-05", time: "08:00", timestamp: "2026-03-05T08:00:00Z", weightKg: 79 },
      { id: "3", kind: "body", date: "2026-03-10", time: "08:00", timestamp: "2026-03-10T08:00:00Z", weightKg: 78, bodyFatPercent: 22 },
    ];
    const series = extractTimeSeries(mixedRecords, "bodyFatPercent");
    expect(series).toHaveLength(1);
    expect(series[0].value).toBe(22);
  });

  it("calculates goal progress summaries", () => {
    const settings: AppSettings = {
      ...dummySettings,
      targetWeightKg: 75,
    };
    const progress = computeGoalProgress(sampleRecords, settings);
    expect(progress).toBeDefined();
    expect(progress?.currentWeight).toBe(78);
    expect(progress?.startWeight).toBe(80);
    expect(progress?.targetWeight).toBe(75);
    expect(progress?.remainingWeight).toBe(-3);
    expect(progress?.percentComplete).toBe(40);
  });

  it("summarizes all metrics in one pass", () => {
    const allSummaries = summarizeAllMetrics(sampleRecords);
    expect(allSummaries.weightKg).toBeDefined();
    expect(allSummaries.weightKg?.count).toBe(3);
    expect(allSummaries.systolic?.count).toBe(1);
    expect(allSummaries.glucoseMgDl?.count).toBe(0);
  });
});
