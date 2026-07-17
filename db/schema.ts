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
  measuredDate: date("measured_date").generatedAlwaysAs(sql`(measured_at::date)`),
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
  
  bmiCategory: text("bmi_category").generatedAlwaysAs(sql`
    CASE
      WHEN bmi IS NULL THEN NULL
      WHEN bmi < 18.5 THEN 'Underweight'
      WHEN bmi < 25 THEN 'Normal'
      WHEN bmi < 30 THEN 'Overweight'
      ELSE 'Obese'
    END
  `),
  bodyFatCategory: text("body_fat_category").generatedAlwaysAs(sql`
    CASE
      WHEN body_fat_pct IS NULL THEN NULL
      WHEN body_fat_pct < 6 THEN 'Essential Fat'
      WHEN body_fat_pct < 14 THEN 'Athletic'
      WHEN body_fat_pct < 18 THEN 'Fitness'
      WHEN body_fat_pct < 25 THEN 'Average'
      ELSE 'Obese'
    END
  `),
  
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_body_user_time").on(table.userId, table.measuredAt.desc()),
  index("idx_body_user_date").on(table.userId, table.measuredDate.desc()),
]);

export const bloodPressureLogs = pgTable("blood_pressure_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  measuredDate: date("measured_date").generatedAlwaysAs(sql`(measured_at::date)`),
  systolic: smallint("systolic").notNull(),
  diastolic: smallint("diastolic").notNull(),
  pulse: smallint("pulse"),
  
  category: text("category").generatedAlwaysAs(sql`
    CASE
      WHEN systolic >= 140 OR diastolic >= 90 THEN 'Hypertension Stage 2'
      WHEN systolic >= 130 OR diastolic >= 80 THEN 'Hypertension Stage 1'
      WHEN systolic >= 120 AND systolic < 130 AND diastolic < 80 THEN 'Elevated'
      ELSE 'Normal'
    END
  `),
  
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_bp_user_time").on(table.userId, table.measuredAt.desc()),
  index("idx_bp_user_date").on(table.userId, table.measuredDate.desc()),
]);

export const bloodGlucoseLogs = pgTable("blood_glucose_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  measuredDate: date("measured_date").generatedAlwaysAs(sql`(measured_at::date)`),
  glucoseMgDl: smallint("glucose_mg_dl").notNull(),
  
  category: text("category").generatedAlwaysAs(sql`
    CASE
      WHEN glucose_mg_dl >= 126 THEN 'Diabetes'
      WHEN glucose_mg_dl >= 100 THEN 'Prediabetes'
      ELSE 'Normal'
    END
  `),
  
  notes: text("notes"),
  source: text("source").default('manual'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_glucose_user_time").on(table.userId, table.measuredAt.desc()),
  index("idx_glucose_user_date").on(table.userId, table.measuredDate.desc()),
]);
