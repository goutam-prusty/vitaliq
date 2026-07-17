CREATE TABLE "blood_glucose_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"measured_date" date GENERATED ALWAYS AS ((measured_at::date)) STORED,
	"glucose_mg_dl" smallint NOT NULL,
	"category" text GENERATED ALWAYS AS (
    CASE
      WHEN glucose_mg_dl >= 126 THEN 'Diabetes'
      WHEN glucose_mg_dl >= 100 THEN 'Prediabetes'
      ELSE 'Normal'
    END
  ) STORED,
	"notes" text,
	"source" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blood_pressure_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"measured_date" date GENERATED ALWAYS AS ((measured_at::date)) STORED,
	"systolic" smallint NOT NULL,
	"diastolic" smallint NOT NULL,
	"pulse" smallint,
	"category" text GENERATED ALWAYS AS (
    CASE
      WHEN systolic >= 140 OR diastolic >= 90 THEN 'Hypertension Stage 2'
      WHEN systolic >= 130 OR diastolic >= 80 THEN 'Hypertension Stage 1'
      WHEN systolic >= 120 AND systolic < 130 AND diastolic < 80 THEN 'Elevated'
      ELSE 'Normal'
    END
  ) STORED,
	"notes" text,
	"source" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "body_composition_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"measured_date" date GENERATED ALWAYS AS ((measured_at::date)) STORED,
	"weight_kg" numeric(5, 1) NOT NULL,
	"bmi" numeric(4, 1),
	"body_fat_pct" numeric(4, 1),
	"muscle_rate_pct" numeric(4, 1),
	"body_water_pct" numeric(4, 1),
	"bone_mass_kg" numeric(4, 2),
	"bmr_kcal" integer,
	"metabolic_age" smallint,
	"visceral_fat_pct" numeric(4, 1),
	"subcutaneous_fat_pct" numeric(4, 1),
	"protein_mass_kg" numeric(4, 2),
	"muscle_mass_kg" numeric(5, 1),
	"weight_without_fat_kg" numeric(5, 1),
	"obesity_level" text,
	"skeletal_muscle_mass_kg" numeric(5, 1),
	"bmi_category" text GENERATED ALWAYS AS (
    CASE
      WHEN bmi IS NULL THEN NULL
      WHEN bmi < 18.5 THEN 'Underweight'
      WHEN bmi < 25 THEN 'Normal'
      WHEN bmi < 30 THEN 'Overweight'
      ELSE 'Obese'
    END
  ) STORED,
	"body_fat_category" text GENERATED ALWAYS AS (
    CASE
      WHEN body_fat_pct IS NULL THEN NULL
      WHEN body_fat_pct < 6 THEN 'Essential Fat'
      WHEN body_fat_pct < 14 THEN 'Athletic'
      WHEN body_fat_pct < 18 THEN 'Fitness'
      WHEN body_fat_pct < 25 THEN 'Average'
      ELSE 'Obese'
    END
  ) STORED,
	"notes" text,
	"source" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"target_weight_kg" numeric(5, 1),
	"target_body_fat_pct" numeric(4, 1),
	"target_date" date,
	"goal_start_date" date,
	"goal_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_goals_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"weight_unit" text DEFAULT 'kg' NOT NULL,
	"height_unit" text DEFAULT 'cm' NOT NULL,
	"glucose_unit" text DEFAULT 'mg/dL' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date_of_birth" date,
	"age_fallback" smallint,
	"sex" text,
	"height_cm" numeric(5, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blood_glucose_logs" ADD CONSTRAINT "blood_glucose_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_pressure_logs" ADD CONSTRAINT "blood_pressure_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_composition_logs" ADD CONSTRAINT "body_composition_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_glucose_user_time" ON "blood_glucose_logs" USING btree ("user_id","measured_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_glucose_user_date" ON "blood_glucose_logs" USING btree ("user_id","measured_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_bp_user_time" ON "blood_pressure_logs" USING btree ("user_id","measured_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_bp_user_date" ON "blood_pressure_logs" USING btree ("user_id","measured_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_body_user_time" ON "body_composition_logs" USING btree ("user_id","measured_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_body_user_date" ON "body_composition_logs" USING btree ("user_id","measured_date" DESC NULLS LAST);