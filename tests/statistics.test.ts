import { describe, expect, it } from "vitest";
import {
  count,
  minimum,
  maximum,
  mean,
  median,
  movingAverage,
  standardDeviation,
  absoluteChange,
  percentageChange,
  trendDirection,
  calculateBmi,
  getBmiCategory,
  getBodyFatCategory,
} from "../core/analytics/statistics";

describe("core statistics calculations", () => {
  it("computes count correctly", () => {
    expect(count([1, 2, 3])).toBe(3);
    expect(count([])).toBe(0);
  });

  it("identifies minimum and maximum", () => {
    expect(minimum([5, 8, 2, 9])).toBe(2);
    expect(minimum([])).toBeUndefined();
    expect(maximum([5, 8, 2, 9])).toBe(9);
    expect(maximum([])).toBeUndefined();
  });

  it("calculates mean", () => {
    expect(mean([10, 20, 30])).toBe(20);
    expect(mean([])).toBeUndefined();
  });

  it("calculates median", () => {
    expect(median([1, 9, 3])).toBe(3);
    expect(median([1, 9, 3, 7])).toBe(5);
    expect(median([])).toBeUndefined();
  });

  it("computes moving averages", () => {
    expect(movingAverage([10, 20, 30], 2)).toEqual([10, 15, 25]);
    expect(movingAverage([10, 20, 30], 3)).toEqual([10, 15, 20]);
    expect(movingAverage([], 3)).toEqual([]);
  });

  it("computes standard deviation", () => {
    const sd = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(sd).toBeCloseTo(2.138, 3);
    expect(standardDeviation([5])).toBeUndefined();
    expect(standardDeviation([])).toBeUndefined();
  });

  it("computes absolute and percentage change", () => {
    expect(absoluteChange(10, 15)).toBe(5);
    expect(percentageChange(10, 15)).toBe(50);
    expect(percentageChange(0, 15)).toBeUndefined();
  });

  it("classifies trend direction", () => {
    expect(trendDirection([100, 101])).toBe("up"); // >0.5%
    expect(trendDirection([100, 100.4])).toBe("flat"); // <0.5%
    expect(trendDirection([100, 99])).toBe("down"); // <-0.5%
  });

  it("calculates BMI and category", () => {
    const bmi = calculateBmi(70, 175);
    expect(bmi).toBeCloseTo(22.86, 2);
    expect(getBmiCategory(22.86)).toBe("normal");
    expect(getBmiCategory(17)).toBe("underweight");
    expect(getBmiCategory(27)).toBe("overweight");
    expect(getBmiCategory(32)).toBe("obese");
  });

  it("classifies body fat categories", () => {
    // Male 30yo
    expect(getBodyFatCategory(5, 30, "male")).toBe("underfat");
    expect(getBodyFatCategory(15, 30, "male")).toBe("healthy");
    expect(getBodyFatCategory(22, 30, "male")).toBe("overfat");
    expect(getBodyFatCategory(27, 30, "male")).toBe("obese");

    // Female 30yo
    expect(getBodyFatCategory(18, 30, "female")).toBe("underfat");
    expect(getBodyFatCategory(28, 30, "female")).toBe("healthy");
    expect(getBodyFatCategory(35, 30, "female")).toBe("overfat");
    expect(getBodyFatCategory(41, 30, "female")).toBe("obese");
  });
});
