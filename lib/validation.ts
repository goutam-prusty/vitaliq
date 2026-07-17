import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^$|^\d{2}:\d{2}$/);
const notes = z.string().max(1000).optional().default("");
const finite = z.coerce.number().finite();
const optionalNumber = z.union([z.literal(""), z.undefined(), finite]).transform((value) => (value === "" ? undefined : value));

export const bodyInputSchema = z.object({
  date,
  time,
  weightKg: finite.positive().max(500),
  bmi: optionalNumber,
  bodyFatPercent: optionalNumber,
  muscleRatePercent: optionalNumber,
  bodyWaterPercent: optionalNumber,
  boneMassKg: optionalNumber,
  bmrKcal: optionalNumber,
  metabolicAge: optionalNumber,
  visceralFatPercent: optionalNumber,
  subcutaneousFatPercent: optionalNumber,
  proteinMassKg: optionalNumber,
  muscleMassKg: optionalNumber,
  weightWithoutFatKg: optionalNumber,
  obesityLevel: z.string().max(80).optional().default(""),
  skeletalMuscleMassKg: optionalNumber,
  notes
});

export const pressureInputSchema = z.object({
  date,
  time,
  systolic: finite.positive().max(400),
  diastolic: finite.positive().max(250),
  pulse: optionalNumber,
  notes
});

export const glucoseInputSchema = z.object({
  date,
  time,
  glucoseMgDl: finite.positive().max(1000),
  notes
});
