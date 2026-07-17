import { HealthRecord, AppSettings, BodyRecord, PressureRecord, GlucoseRecord } from "@/lib/types";
import { parseISO, differenceInCalendarDays } from "date-fns";
import * as engine from "./engine";

export type InsightSeverity = "info" | "success" | "warning" | "attention";
export type InsightCategory = "trend" | "goal" | "activity" | "milestone" | "warning";

export type HealthInsight = {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
  title: string;
  description: string;
  supportingMetrics: string[];
  confidence?: number;
  evaluationPeriod?: string;
};

export type InsightsConfig = {
  inactivityThresholdDays: number;
  significantWeightChangePercent: number;
  minLoggingStreakDays: number;
  bloodPressureHighSystolic: number;
  bloodPressureHighDiastolic: number;
  glucoseHighMgDl: number;
  glucoseLowMgDl: number;
  minRecordsForTrend: number;
};

export const defaultInsightsConfig: InsightsConfig = {
  inactivityThresholdDays: 14,
  significantWeightChangePercent: 3,
  minLoggingStreakDays: 5,
  bloodPressureHighSystolic: 130,
  bloodPressureHighDiastolic: 80,
  glucoseHighMgDl: 140,
  glucoseLowMgDl: 70,
  minRecordsForTrend: 3,
};

/**
 * Main insights generator. Translates raw timelines and goals into deterministic, explainable objects.
 */
export function generateInsights(
  records: HealthRecord[],
  settings: AppSettings,
  configOverrides?: Partial<InsightsConfig>,
  referenceDate?: Date
): HealthInsight[] {
  const config = { ...defaultInsightsConfig, ...configOverrides };
  const insights: HealthInsight[] = [];

  if (records.length === 0) {
    insights.push({
      id: "insufficient_data",
      severity: "info",
      category: "activity",
      title: "Start Logging",
      description: "Welcome! Add your first body, pressure, or glucose entry to start generating trends.",
      supportingMetrics: [],
    });
    return insights;
  }

  // 1. Resolve reference date to ensure determinism
  const resolvedRefDate = referenceDate || parseISO(
    [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp
  );

  // 2. Inactivity Insight
  const newestRecordTime = parseISO(
    [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp
  );
  const inactiveDays = differenceInCalendarDays(resolvedRefDate, newestRecordTime);
  if (inactiveDays >= config.inactivityThresholdDays) {
    insights.push({
      id: `inactivity_${inactiveDays}d`,
      severity: "warning",
      category: "activity",
      title: "Inactivity Alert",
      description: `No health readings have been logged in the last ${inactiveDays} days. Log a new reading to resume trends tracking.`,
      supportingMetrics: [],
      evaluationPeriod: `${inactiveDays} days`,
    });
  }

  // 3. Goal Progress Milestone Insights
  const goal = engine.computeGoalProgress(records, settings);
  if (goal) {
    const { targetWeight, currentWeight, remainingWeight, percentComplete } = goal;
    if (percentComplete !== undefined) {
      if (percentComplete >= 100) {
        insights.push({
          id: "goal_completed",
          severity: "success",
          category: "goal",
          title: "Goal Achieved!",
          description: `Congratulations! You reached your target weight of ${targetWeight.toFixed(1)} kg.`,
          supportingMetrics: ["weightKg"],
        });
      } else if (percentComplete >= 80) {
        insights.push({
          id: "goal_80_percent",
          severity: "success",
          category: "milestone",
          title: "Approaching Target Weight",
          description: `You have completed ${percentComplete.toFixed(0)}% of your weight goal. You are only ${Math.abs(remainingWeight).toFixed(1)} kg away!`,
          supportingMetrics: ["weightKg"],
        });
      } else if (percentComplete >= 50) {
        insights.push({
          id: "goal_50_percent",
          severity: "success",
          category: "milestone",
          title: "Weight Goal Halfway Mark",
          description: `You have completed ${percentComplete.toFixed(0)}% of your weight goal. Current: ${currentWeight.toFixed(1)} kg (Target: ${targetWeight.toFixed(1)} kg).`,
          supportingMetrics: ["weightKg"],
        });
      } else if (percentComplete < 0) {
        insights.push({
          id: "goal_regression",
          severity: "attention",
          category: "goal",
          title: "Weight Goal Regression",
          description: `Your weight has moved away from your target by ${Math.abs(remainingWeight).toFixed(1)} kg compared to your starting point.`,
          supportingMetrics: ["weightKg"],
        });
      }
    }
  }

  // 4. Significant Weight Change Insight (Last 30 Days)
  const monthAgo = new Date(resolvedRefDate);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const weightSummary = engine.summarizeMetric(records, "weightKg", monthAgo, resolvedRefDate);
  if (weightSummary.count >= config.minRecordsForTrend && weightSummary.percentageChange !== undefined) {
    const pct = weightSummary.percentageChange;
    if (Math.abs(pct) >= config.significantWeightChangePercent) {
      insights.push({
        id: "significant_weight_change",
        severity: "attention",
        category: "trend",
        title: "Significant Weight Change",
        description: `Your weight has ${pct > 0 ? "increased" : "decreased"} by ${Math.abs(pct).toFixed(1)}% over the last 30 days.`,
        supportingMetrics: ["weightKg"],
        evaluationPeriod: "30 days",
      });
    }
  }

  // 5. Blood Pressure Elevated Insight
  const bpRecords = records.filter((r): r is PressureRecord => r.kind === "pressure");
  if (bpRecords.length > 0) {
    const latestBp = [...bpRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (
      latestBp.systolic >= config.bloodPressureHighSystolic ||
      latestBp.diastolic >= config.bloodPressureHighDiastolic
    ) {
      insights.push({
        id: "elevated_blood_pressure",
        severity: "warning",
        category: "warning",
        title: "Elevated Blood Pressure",
        description: `Your latest reading is elevated: ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category}).`,
        supportingMetrics: ["systolic", "diastolic"],
      });
    }
  }

  // 6. Blood Glucose Out of Range Insight
  const glucoseRecords = records.filter((r): r is GlucoseRecord => r.kind === "glucose");
  if (glucoseRecords.length > 0) {
    const latestGlucose = [...glucoseRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (latestGlucose.glucoseMgDl >= config.glucoseHighMgDl) {
      insights.push({
        id: "high_glucose",
        severity: "warning",
        category: "warning",
        title: "High Blood Glucose",
        description: `Your latest fasting glucose is elevated: ${latestGlucose.glucoseMgDl} mg/dL (${latestGlucose.category}).`,
        supportingMetrics: ["glucoseMgDl"],
      });
    } else if (latestGlucose.glucoseMgDl <= config.glucoseLowMgDl) {
      insights.push({
        id: "low_glucose",
        severity: "warning",
        category: "warning",
        title: "Low Blood Glucose",
        description: `Your latest glucose reading is low: ${latestGlucose.glucoseMgDl} mg/dL (${latestGlucose.category}).`,
        supportingMetrics: ["glucoseMgDl"],
      });
    }
  }

  // 7. Logging Streak Insight
  const streak = calculateLoggingStreak(records, resolvedRefDate);
  if (streak >= config.minLoggingStreakDays) {
    insights.push({
      id: `logging_streak_${streak}d`,
      severity: "success",
      category: "activity",
      title: "Logging Streak!",
      description: `You have logged health measurements for ${streak} consecutive days. Keep up the consistent logging!`,
      supportingMetrics: [],
      evaluationPeriod: `${streak} days`,
    });
  }

  return insights;
}

/**
 * Calculates consecutive logging streak days going backward from reference date.
 */
function calculateLoggingStreak(records: HealthRecord[], referenceDate: Date): number {
  const dates = Array.from(new Set(records.map((r) => r.date))).sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) return 0;

  const refStr = referenceDate.toISOString().split("T")[0];
  const streak = 0;
  const runner = new Date(referenceDate);

  // If the user has not logged today, check if they have a streak starting yesterday
  let loggedTodayOrYesterday = false;
  
  for (let d = 0; d < 2; d++) {
    const checkStr = runner.toISOString().split("T")[0];
    if (dates.includes(checkStr)) {
      loggedTodayOrYesterday = true;
      break;
    }
    runner.setDate(runner.getDate() - 1);
  }

  if (!loggedTodayOrYesterday) return 0;

  // Reset runner to the date we found
  let streakCount = 0;
  for (let i = 0; i < 365; i++) { // Safety limit of 1 year max streak check
    const checkStr = runner.toISOString().split("T")[0];
    if (dates.includes(checkStr)) {
      streakCount++;
      runner.setDate(runner.getDate() - 1);
    } else {
      break;
    }
  }

  return streakCount;
}

const severityOrder: Record<InsightSeverity, number> = {
  attention: 0,
  warning: 1,
  success: 2,
  info: 3,
};

function getCategoryPriority(id: string): number {
  if (id === "goal_completed" || id === "goal_regression" || id.startsWith("goal_")) return 0;
  if (id === "elevated_blood_pressure" || id === "high_glucose" || id === "low_glucose") return 1;
  if (id === "significant_weight_change") return 2;
  if (id.startsWith("logging_streak_") || id.startsWith("inactivity_")) return 3;
  return 4;
}

/**
 * Deterministically prioritizes insights based on severity and then business category importance.
 */
export function prioritizeInsights(insights: HealthInsight[]): HealthInsight[] {
  return [...insights].sort((a, b) => {
    const sevA = severityOrder[a.severity] ?? 99;
    const sevB = severityOrder[b.severity] ?? 99;
    if (sevA !== sevB) return sevA - sevB;

    const catA = getCategoryPriority(a.id);
    const catB = getCategoryPriority(b.id);
    if (catA !== catB) return catA - catB;

    return a.id.localeCompare(b.id);
  });
}

