export type LogKind = "body" | "pressure" | "glucose";
export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft-in";
export type GlucoseUnit = "mg/dL" | "mmol/L";

export type BaseRecord = {
  id: string;
  kind: LogKind;
  date: string;
  time: string;
  timestamp: string;
  notes?: string;
};

export type BodyRecord = BaseRecord & {
  kind: "body";
  weightKg: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleRatePercent?: number;
  bodyWaterPercent?: number;
  boneMassKg?: number;
  bmrKcal?: number;
  metabolicAge?: number;
  visceralFatPercent?: number;
  subcutaneousFatPercent?: number;
  proteinMassKg?: number;
  muscleMassKg?: number;
  weightWithoutFatKg?: number;
  obesityLevel?: string;
  skeletalMuscleMassKg?: number;
  bmiCategory?: string;
  bodyFatCategory?: string;
};

export type PressureRecord = BaseRecord & {
  kind: "pressure";
  systolic: number;
  diastolic: number;
  pulse?: number;
  category: string;
};

export type GlucoseRecord = BaseRecord & {
  kind: "glucose";
  glucoseMgDl: number;
  category: string;
};

export type HealthRecord = BodyRecord | PressureRecord | GlucoseRecord;

export type AppSettings = {
  name?: string;
  dateOfBirth?: string;
  ageFallback?: number;
  sex?: "male" | "female" | "other" | "not_specified";
  heightCm?: number;
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  targetDate?: string;
  goalNote?: string;
  preferredWeightUnit: WeightUnit;
  preferredHeightUnit: HeightUnit;
  preferredGlucoseUnit: GlucoseUnit;
  timezone: string;
  theme: "system" | "light" | "dark";
  goalStartDate?: string;
};
