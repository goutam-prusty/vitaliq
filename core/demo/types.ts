export interface DemoScenario {
  id: string; // e.g. "raj-shamani-v1"
  seed: string;
  user: {
    id: string; // The Clerk ID for the demo account
    email: string;
    displayName: string;
  };
  profile: {
    heightCm: number;
    dateOfBirth: string; // YYYY-MM-DD
    sex: "male" | "female" | "other" | "not_specified";
  };
  goals: {
    targetWeightKg: number;
    targetBodyFatPct: number;
  };
  timeline: {
    startDate: string; // ISO 8601
    endDate: string; // ISO 8601
  };
  phases: Phase[];
  events: TimelineEvent[];
}

export interface Phase {
  startDayOffset: number; // Day index from startDate (0-indexed)
  endDayOffset: number;
  startMetrics: PhaseMetrics;
  endMetrics: PhaseMetrics;
  volatility: "low" | "normal" | "high";
}

export interface PhaseMetrics {
  weightKg: number;
  bodyFatPct: number;
  stressLevel: number; // 0 to 10
  activityLevel: number; // 0 to 10
}

export interface TimelineEvent {
  dayOffset: number;
  type: "stress" | "vacation" | "exercise" | "diet";
  note: string;
  durationDays: number;
  impact: {
    weightOffset?: number; // Added to base during duration
    stressOffset?: number; // Added to base during duration
    activityOffset?: number; // Added to base during duration
    sleepQualityOffset?: number;
  };
}

export interface HealthState {
  date: Date;
  weightKg: number;
  bodyFatPct: number;
  stressLevel: number; // 0-10
  activityLevel: number; // 0-10
  sleepQuality: number; // 0-10
  hydration: number; // 0-10
  activeEvents: TimelineEvent[];
}
