import type { HealthRecord, LogKind } from "@/lib/types";

export type MetricKey =
  | "weightKg" | "bmi" | "bodyFatPercent" | "muscleRatePercent" | "bodyWaterPercent" | "boneMassKg" | "bmrKcal" | "metabolicAge"
  | "visceralFatPercent" | "subcutaneousFatPercent" | "proteinMassKg" | "muscleMassKg" | "weightWithoutFatKg" | "skeletalMuscleMassKg"
  | "systolic" | "diastolic" | "pulse" | "glucoseMgDl";

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  unit: string;
  precision: number;
  kind: LogKind;
  color: string;
};

export const metrics: MetricDefinition[] = [
  { key: "weightKg", label: "Weight", unit: "kg", precision: 1, kind: "body", color: "#146f65" },
  { key: "bmi", label: "BMI", unit: "", precision: 1, kind: "body", color: "#7c5c28" },
  { key: "bodyFatPercent", label: "Body Fat", unit: "%", precision: 1, kind: "body", color: "#a83c30" },
  { key: "muscleRatePercent", label: "Muscle Rate", unit: "%", precision: 1, kind: "body", color: "#376f9f" },
  { key: "bodyWaterPercent", label: "Body Water", unit: "%", precision: 1, kind: "body", color: "#447b73" },
  { key: "boneMassKg", label: "Bone Mass", unit: "kg", precision: 2, kind: "body", color: "#6a655d" },
  { key: "bmrKcal", label: "BMR", unit: "kcal", precision: 0, kind: "body", color: "#8a5b2c" },
  { key: "metabolicAge", label: "Metabolic Age", unit: "yr", precision: 0, kind: "body", color: "#75618f" },
  { key: "visceralFatPercent", label: "Visceral Fat", unit: "%", precision: 1, kind: "body", color: "#9a4d48" },
  { key: "subcutaneousFatPercent", label: "Subcutaneous Fat", unit: "%", precision: 1, kind: "body", color: "#b05f52" },
  { key: "proteinMassKg", label: "Protein Mass", unit: "kg", precision: 2, kind: "body", color: "#66733f" },
  { key: "muscleMassKg", label: "Muscle Mass", unit: "kg", precision: 1, kind: "body", color: "#2f7468" },
  { key: "weightWithoutFatKg", label: "Weight Without Fat", unit: "kg", precision: 1, kind: "body", color: "#587d62" },
  { key: "skeletalMuscleMassKg", label: "Skeletal Muscle Mass", unit: "kg", precision: 1, kind: "body", color: "#315f82" },
  { key: "systolic", label: "Systolic", unit: "mmHg", precision: 0, kind: "pressure", color: "#a83c30" },
  { key: "diastolic", label: "Diastolic", unit: "mmHg", precision: 0, kind: "pressure", color: "#376f9f" },
  { key: "pulse", label: "Pulse", unit: "bpm", precision: 0, kind: "pressure", color: "#7c5c28" },
  { key: "glucoseMgDl", label: "Glucose", unit: "mg/dL", precision: 0, kind: "glucose", color: "#146f65" }
];

export function valueFor(record: HealthRecord, key: MetricKey) {
  return (record as unknown as Record<MetricKey, number | undefined>)[key];
}
