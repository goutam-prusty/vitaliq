export type TrendDirection = "up" | "down" | "flat";
export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";
export type BodyFatCategory = "underfat" | "healthy" | "overfat" | "obese";

/**
 * Returns the count of numeric items.
 */
export function count(values: number[]): number {
  return values.length;
}

/**
 * Returns the minimum numeric value or undefined if empty.
 */
export function minimum(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return Math.min(...values);
}

/**
 * Returns the maximum numeric value or undefined if empty.
 */
export function maximum(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return Math.max(...values);
}

/**
 * Returns the mean (average) of the values or undefined if empty.
 */
export function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Returns the median of the values or undefined if empty.
 */
export function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Computes the simple moving averages across the values for a given window period.
 * For index i < period - 1, it computes the average of elements up to i.
 */
export function movingAverage(values: number[], period: number): number[] {
  if (period <= 0 || values.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - period + 1);
    const windowValues = values.slice(start, i + 1);
    const sum = windowValues.reduce((s, v) => s + v, 0);
    result.push(sum / windowValues.length);
  }
  return result;
}

/**
 * Returns the sample standard deviation (N-1) of values or undefined if count <= 1.
 */
export function standardDeviation(values: number[]): number | undefined {
  if (values.length <= 1) return undefined;
  const avg = mean(values)!;
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  const variance = squareDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Returns the absolute difference: last - first.
 */
export function absoluteChange(first: number, last: number): number {
  return last - first;
}

/**
 * Returns the percentage change or undefined if first is 0.
 */
export function percentageChange(first: number, last: number): number | undefined {
  if (first === 0) return undefined;
  return ((last - first) / Math.abs(first)) * 100;
}

/**
 * Returns the trend direction based on first-to-last changes,
 * applying a minor relative 0.5% threshold to absorb noise.
 */
export function trendDirection(values: number[]): TrendDirection {
  if (values.length <= 1) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;
  const threshold = Math.abs(first) * 0.005; // 0.5% noise margin
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "flat";
}

/**
 * Returns calculated Body Mass Index (BMI) or undefined for invalid inputs.
 */
export function calculateBmi(weightKg: number, heightCm: number): number | undefined {
  if (weightKg <= 0 || heightCm <= 0) return undefined;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Returns the corresponding BMI weight classification category.
 */
export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25.0) return "normal";
  if (bmi < 30.0) return "overweight";
  return "obese";
}

/**
 * Returns the body fat percentage classification category based on age and biological sex brackets.
 * Fallbacks default to standard male boundaries and the 20-39 age bracket.
 */
export function getBodyFatCategory(
  bodyFatPercent: number,
  age?: number,
  sex?: "male" | "female" | "other" | "not_specified"
): BodyFatCategory {
  const resolvedSex = sex === "female" ? "female" : "male";
  const resolvedAge = age ?? 30;

  if (resolvedSex === "female") {
    if (resolvedAge < 40) {
      if (bodyFatPercent < 21) return "underfat";
      if (bodyFatPercent <= 33) return "healthy";
      if (bodyFatPercent <= 39) return "overfat";
      return "obese";
    } else if (resolvedAge < 60) {
      if (bodyFatPercent < 23) return "underfat";
      if (bodyFatPercent <= 35) return "healthy";
      if (bodyFatPercent <= 40) return "overfat";
      return "obese";
    } else {
      if (bodyFatPercent < 24) return "underfat";
      if (bodyFatPercent <= 36) return "healthy";
      if (bodyFatPercent <= 42) return "overfat";
      return "obese";
    }
  } else {
    if (resolvedAge < 40) {
      if (bodyFatPercent < 8) return "underfat";
      if (bodyFatPercent <= 20) return "healthy";
      if (bodyFatPercent <= 25) return "overfat";
      return "obese";
    } else if (resolvedAge < 60) {
      if (bodyFatPercent < 11) return "underfat";
      if (bodyFatPercent <= 22) return "healthy";
      if (bodyFatPercent <= 28) return "overfat";
      return "obese";
    } else {
      if (bodyFatPercent < 13) return "underfat";
      if (bodyFatPercent <= 25) return "healthy";
      if (bodyFatPercent <= 30) return "overfat";
      return "obese";
    }
  }
}
