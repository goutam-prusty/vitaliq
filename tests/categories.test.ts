import { describe, expect, it } from "vitest";
import { bodyFatCategory, bmiCategory, bpCategory, glucoseCategory } from "@/lib/categories";

describe("category calculations", () => {
  it("matches workbook blood pressure logic", () => {
    expect(bpCategory(118, 78)).toBe("Normal");
    expect(bpCategory(125, 77)).toBe("Elevated");
    expect(bpCategory(130, 70)).toBe("Hypertension Stage 1");
    expect(bpCategory(120, 82)).toBe("Hypertension Stage 1");
    expect(bpCategory(140, 70)).toBe("Hypertension Stage 2");
    expect(bpCategory(120, 90)).toBe("Hypertension Stage 2");
  });

  it("matches workbook glucose logic", () => {
    expect(glucoseCategory(99)).toBe("Normal");
    expect(glucoseCategory(100)).toBe("Prediabetes");
    expect(glucoseCategory(126)).toBe("Diabetes");
  });

  it("matches workbook BMI and body-fat formulas", () => {
    expect(bmiCategory(18.4)).toBe("Underweight");
    expect(bmiCategory(18.5)).toBe("Normal");
    expect(bmiCategory(25)).toBe("Overweight");
    expect(bmiCategory(30)).toBe("Obese");
    expect(bodyFatCategory(5.9)).toBe("Essential Fat");
    expect(bodyFatCategory(6)).toBe("Athletic");
    expect(bodyFatCategory(14)).toBe("Fitness");
    expect(bodyFatCategory(18)).toBe("Average");
    expect(bodyFatCategory(25)).toBe("Obese");
  });
});
