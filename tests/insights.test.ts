import { describe, expect, it } from "vitest";
import { generateInsights, prioritizeInsights } from "../core/analytics/insights";
import { HealthRecord, AppSettings } from "@/lib/types";

describe("core analytics insights engine", () => {
  const dummySettings: AppSettings = {
    preferredWeightUnit: "kg",
    preferredHeightUnit: "cm",
    preferredGlucoseUnit: "mg/dL",
    timezone: "Asia/Kolkata",
    theme: "system",
  };

  it("handles empty datasets by prompting logging", () => {
    const insights = generateInsights([], dummySettings);
    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe("insufficient_data");
    expect(insights[0].severity).toBe("info");
  });

  it("evaluates weight goal progress milestones", () => {
    const settings: AppSettings = {
      ...dummySettings,
      targetWeightKg: 70,
      goalStartDate: "2026-03-01",
    };
    
    // Starting at 80kg, now 71.8kg (Goal complete percent: (71.8-80)/(70-80) = -8.2 / -10 = 82% complete)
    const records: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
      { id: "2", kind: "body", date: "2026-03-10", time: "08:00", timestamp: "2026-03-10T08:00:00Z", weightKg: 71.8 },
    ];

    const insights = generateInsights(records, settings);
    const goalInsight = insights.find((i) => i.id === "goal_80_percent");
    expect(goalInsight).toBeDefined();
    expect(goalInsight?.severity).toBe("success");
    expect(goalInsight?.title).toBe("Approaching Target Weight");
  });

  it("evaluates goal regression correctly", () => {
    const settings: AppSettings = {
      ...dummySettings,
      targetWeightKg: 70,
      goalStartDate: "2026-03-01",
    };

    // Starting at 80kg, now 82kg (moved away from target)
    const records: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
      { id: "2", kind: "body", date: "2026-03-10", time: "08:00", timestamp: "2026-03-10T08:00:00Z", weightKg: 82 },
    ];

    const insights = generateInsights(records, settings);
    const regressionInsight = insights.find((i) => i.id === "goal_regression");
    expect(regressionInsight).toBeDefined();
    expect(regressionInsight?.severity).toBe("attention");
  });

  it("detects logging streaks", () => {
    const records: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
      { id: "2", kind: "body", date: "2026-03-02", time: "08:00", timestamp: "2026-03-02T08:00:00Z", weightKg: 80 },
      { id: "3", kind: "body", date: "2026-03-03", time: "08:00", timestamp: "2026-03-03T08:00:00Z", weightKg: 80 },
      { id: "4", kind: "body", date: "2026-03-04", time: "08:00", timestamp: "2026-03-04T08:00:00Z", weightKg: 80 },
      { id: "5", kind: "body", date: "2026-03-05", time: "08:00", timestamp: "2026-03-05T08:00:00Z", weightKg: 80 },
    ];
    
    const refDate = new Date("2026-03-05T12:00:00Z");
    const insights = generateInsights(records, dummySettings, {}, refDate);
    const streakInsight = insights.find((i) => i.id.startsWith("logging_streak_"));
    expect(streakInsight).toBeDefined();
    expect(streakInsight?.id).toBe("logging_streak_5d");
  });

  it("triggers inactivity alert", () => {
    const records: HealthRecord[] = [
      { id: "1", kind: "body", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", weightKg: 80 },
    ];
    // Evaluate relative to 2026-03-20 (19 days later)
    const refDate = new Date("2026-03-20T08:00:00Z");
    const insights = generateInsights(records, dummySettings, {}, refDate);
    const inactivityInsight = insights.find((i) => i.id.startsWith("inactivity_"));
    expect(inactivityInsight).toBeDefined();
    expect(inactivityInsight?.severity).toBe("warning");
  });

  it("detects elevated blood pressure and glucose alerts", () => {
    const records: HealthRecord[] = [
      { id: "1", kind: "pressure", date: "2026-03-01", time: "08:00", timestamp: "2026-03-01T08:00:00Z", systolic: 140, diastolic: 90, category: "Stage 2 Hypertension" },
      { id: "2", kind: "glucose", date: "2026-03-01", time: "09:00", timestamp: "2026-03-01T09:00:00Z", glucoseMgDl: 150, category: "Elevated" },
    ];
    const insights = generateInsights(records, dummySettings);
    expect(insights.find((i) => i.id === "elevated_blood_pressure")).toBeDefined();
    expect(insights.find((i) => i.id === "high_glucose")).toBeDefined();
  });

  it("prioritizes insights deterministically", () => {
    const mixed: any[] = [
      { id: "logging_streak_5d", severity: "success" },
      { id: "goal_regression", severity: "attention" },
      { id: "elevated_blood_pressure", severity: "warning" },
      { id: "high_glucose", severity: "warning" },
    ];
    const sorted = prioritizeInsights(mixed);
    expect(sorted[0].id).toBe("goal_regression"); // severity attention
    expect(sorted[1].id).toBe("elevated_blood_pressure"); // severity warning, category priority 1
    expect(sorted[2].id).toBe("high_glucose"); // severity warning, category priority 1 (alphabetical bp < glucose)
    expect(sorted[3].id).toBe("logging_streak_5d"); // severity success
  });
});
