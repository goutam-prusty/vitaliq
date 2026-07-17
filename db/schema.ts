import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  smallint,
  numeric,
  integer,
  uniqueIndex,
  index
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk userId
  email: text("email"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  dateOfBirth: date("date_of_birth"),
  ageFallback: smallint("age_fallback"),
  sex: text("sex", { enum: ['male', 'female', 'other', 'not_specified'] }),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 1 }),
  targetBodyFatPct: numeric("target_body_fat_pct", { precision: 4, scale: 1 }),
  targetDate: date("target_date"),
  goalStartDate: date("goal_start_date"),
  goalNote: text("goal_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  weightUnit: text("weight_unit").default('kg').notNull(),
  heightUnit: text("height_unit").default('cm').notNull(),
  glucoseUnit: text("glucose_unit").default('mg/dL').notNull(),
  timezone: text("timezone").default('Asia/Kolkata').notNull(),
  theme: text("theme").default('system').notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bodyCompositionLogs = pgTable("body_composition_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }).notNull(),
  bmi: numeric("bmi", { precision: 4, scale: 1 }),
  bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
  muscleRatePct: numeric("muscle_rate_pct", { precision: 4, scale: 1 }),
  bodyWaterPct: numeric("body_water_pct", { precision: 4, scale: 1 }),
  boneMassKg: numeric("bone_mass_kg", { precision: 4, scale: 2 }),
  bmrKcal: integer("bmr_kcal"),
  metabolicAge: smallint("metabolic_age"),
  visceralFatPct: numeric("visceral_fat_pct", { precision: 4, scale: 1 }),
  subcutaneousFatPct: numeric("subcutaneous_fat_pct", { precision: 4, scale: 1 }),
  proteinMassKg: numeric("protein_mass_kg", { precision: 4, scale: 2 }),
  muscleMassKg: numeric("muscle_mass_kg", { precision: 5, scale: 1 }),
  weightWithoutFatKg: numeric("weight_without_fat_kg", { precision: 5, scale: 1 }),
  obesityLevel: text("obesity_level"),
  skeletalMuscleMassKg: numeric("skeletal_muscle_mass_kg", { precision: 5, scale: 1 }),
  
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_body_user_time").on(table.userId, table.measuredAt.desc())
]);

export const bloodPressureLogs = pgTable("blood_pressure_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  systolic: smallint("systolic").notNull(),
  diastolic: smallint("diastolic").notNull(),
  pulse: smallint("pulse"),
  
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_bp_user_time").on(table.userId, table.measuredAt.desc())
]);

export const bloodGlucoseLogs = pgTable("blood_glucose_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  glucoseMgDl: smallint("glucose_mg_dl").notNull(),
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_glucose_user_time").on(table.userId, table.measuredAt.desc())
]);
