import { z } from "zod";
import type { AppSettings } from "@/lib/types";
import { getServerEnv } from "@/lib/env";

export const settingsDefaults: AppSettings = {
  preferredWeightUnit: "kg",
  preferredHeightUnit: "cm",
  preferredGlucoseUnit: "mg/dL",
  timezone: getServerEnv().timezone,
  theme: "system"
};

export const settingsSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  ageFallback: z.coerce.number().int().min(0).max(130).optional().or(z.literal("")),
  sex: z.enum(["male", "female", "other", "not_specified"]).optional(),
  heightCm: z.coerce.number().positive().max(260).optional().or(z.literal("")),
  targetWeightKg: z.coerce.number().positive().max(500).optional().or(z.literal("")),
  targetBodyFatPercent: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  goalNote: z.string().max(500).optional().or(z.literal("")),
  preferredWeightUnit: z.enum(["kg", "lb"]).default("kg"),
  preferredHeightUnit: z.enum(["cm", "ft-in"]).default("cm"),
  preferredGlucoseUnit: z.enum(["mg/dL", "mmol/L"]).default("mg/dL"),
  timezone: z.string().min(1).max(80).default(getServerEnv().timezone),
  theme: z.enum(["system", "light", "dark"]).default("system"),
  goalStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(""))
});

export function sanitizeSettings(input: unknown): AppSettings {
  const parsed = settingsSchema.parse(input);
  const clean = Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== "" && value !== undefined));
  return { ...settingsDefaults, ...clean } as AppSettings;
}

export const settingKeys = Object.keys(settingsSchema.shape) as Array<keyof AppSettings>;
