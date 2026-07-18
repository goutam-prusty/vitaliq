import { DemoScenario } from "../types";
import { addDays, subDays } from "date-fns";

const TOTAL_DAYS = 300; // ~10 months
// We want the end date to be today so the dashboard feels current.
const endDateObj = new Date();
const startDateObj = subDays(endDateObj, TOTAL_DAYS);

export const rajShamaniV1: DemoScenario = {
  id: "raj-shamani-v1",
  seed: "raj-shamani-v1",
  user: {
    id: "demo-raj-shamani",
    email: "raj.shamani@example.com",
    displayName: "Raj Shamani",
  },
  profile: {
    heightCm: 178,
    dateOfBirth: "1995-01-01",
    sex: "male",
  },
  goals: {
    targetWeightKg: 80,
    targetBodyFatPct: 18,
  },
  timeline: {
    startDate: startDateObj.toISOString(),
    endDate: endDateObj.toISOString(),
  },
  // Phase 1: Small improvements (Day 0 - 42)
  // Phase 2: Strong progress (Day 42 - 140)
  // Phase 3: Plateau (Day 140 - 210)
  // Phase 4: Temporary setback (Day 210 - 238)
  // Phase 5: Recovery (Day 238 - 300)
  phases: [
    {
      startDayOffset: 0,
      endDayOffset: 42,
      startMetrics: { weightKg: 94, bodyFatPct: 29.0, stressLevel: 6, activityLevel: 4 },
      endMetrics: { weightKg: 92, bodyFatPct: 28.0, stressLevel: 5, activityLevel: 5 },
      volatility: "normal",
    },
    {
      startDayOffset: 42,
      endDayOffset: 140,
      startMetrics: { weightKg: 92, bodyFatPct: 28.0, stressLevel: 5, activityLevel: 5 },
      endMetrics: { weightKg: 83, bodyFatPct: 21.0, stressLevel: 4, activityLevel: 7 },
      volatility: "normal",
    },
    {
      startDayOffset: 140,
      endDayOffset: 210,
      startMetrics: { weightKg: 83, bodyFatPct: 21.0, stressLevel: 4, activityLevel: 7 },
      endMetrics: { weightKg: 82.5, bodyFatPct: 20.5, stressLevel: 5, activityLevel: 6 },
      volatility: "low",
    },
    {
      startDayOffset: 210,
      endDayOffset: 238,
      startMetrics: { weightKg: 82.5, bodyFatPct: 20.5, stressLevel: 5, activityLevel: 6 },
      endMetrics: { weightKg: 85, bodyFatPct: 21.5, stressLevel: 8, activityLevel: 3 },
      volatility: "high",
    },
    {
      startDayOffset: 238,
      endDayOffset: TOTAL_DAYS,
      startMetrics: { weightKg: 85, bodyFatPct: 21.5, stressLevel: 8, activityLevel: 3 },
      endMetrics: { weightKg: 79, bodyFatPct: 18.5, stressLevel: 4, activityLevel: 8 },
      volatility: "normal",
    },
  ],
  events: [
    {
      dayOffset: 45,
      type: "exercise",
      note: "Started strength training",
      durationDays: 14,
      impact: { activityOffset: 2, stressOffset: 1 },
    },
    {
      dayOffset: 212,
      type: "vacation",
      note: "Vacation - ate poorly, less exercise",
      durationDays: 14,
      impact: { weightOffset: 1.5, activityOffset: -3, stressOffset: -2 },
    },
    {
      dayOffset: 230,
      type: "stress",
      note: "Increased work stress",
      durationDays: 10,
      impact: { stressOffset: 3, sleepQualityOffset: -3 } as any, // sleepQualityOffset not in interface, let's keep it simple
    },
    {
      dayOffset: 240,
      type: "diet",
      note: "Switched to higher protein diet",
      durationDays: 30,
      impact: { weightOffset: -0.5 },
    }
  ]
};
