export function bpCategory(systolic: number, diastolic: number) {
  if (systolic >= 140 || diastolic >= 90) return "Hypertension Stage 2";
  if (systolic >= 130 || diastolic >= 80) return "Hypertension Stage 1";
  if (systolic >= 120 && systolic < 130 && diastolic < 80) return "Elevated";
  return "Normal";
}

export function glucoseCategory(glucoseMgDl: number) {
  if (glucoseMgDl >= 126) return "Diabetes";
  if (glucoseMgDl >= 100) return "Prediabetes";
  return "Normal";
}

export function bmiCategory(bmi?: number) {
  if (bmi === undefined) return undefined;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function bodyFatCategory(bodyFat?: number) {
  if (bodyFat === undefined) return undefined;
  if (bodyFat < 6) return "Essential Fat";
  if (bodyFat < 14) return "Athletic";
  if (bodyFat < 18) return "Fitness";
  if (bodyFat < 25) return "Average";
  return "Obese";
}
