import type { AppSettings, GlucoseUnit, HeightUnit, WeightUnit } from "@/lib/types";

export const KG_TO_LB = 2.2046226218;

export function weightFromKg(value: number, unit: WeightUnit) {
  return unit === "lb" ? value * KG_TO_LB : value;
}

export function weightToKg(value: number, unit: WeightUnit) {
  return unit === "lb" ? value / KG_TO_LB : value;
}

export function glucoseFromMgDl(value: number, unit: GlucoseUnit) {
  return unit === "mmol/L" ? value / 18.0182 : value;
}

export function glucoseToMgDl(value: number, unit: GlucoseUnit) {
  return unit === "mmol/L" ? value * 18.0182 : value;
}

export function heightFromCm(value: number, unit: HeightUnit) {
  if (unit === "cm") return { value, label: `${Math.round(value)} cm` };
  const totalInches = value / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { value: totalInches, label: `${feet} ft ${inches} in` };
}

export function displayWeight(valueKg: number | undefined, settings: AppSettings, precision = 1) {
  if (valueKg === undefined) return "—";
  const value = weightFromKg(valueKg, settings.preferredWeightUnit);
  return `${value.toFixed(precision)} ${settings.preferredWeightUnit}`;
}

export function displayGlucose(valueMgDl: number | undefined, settings: AppSettings) {
  if (valueMgDl === undefined) return "—";
  const value = glucoseFromMgDl(valueMgDl, settings.preferredGlucoseUnit);
  return `${value.toFixed(settings.preferredGlucoseUnit === "mmol/L" ? 1 : 0)} ${settings.preferredGlucoseUnit}`;
}
