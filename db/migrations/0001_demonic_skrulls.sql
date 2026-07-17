DROP INDEX "idx_glucose_user_date";--> statement-breakpoint
DROP INDEX "idx_bp_user_date";--> statement-breakpoint
DROP INDEX "idx_body_user_date";--> statement-breakpoint
ALTER TABLE "blood_glucose_logs" DROP COLUMN "measured_date";--> statement-breakpoint
ALTER TABLE "blood_glucose_logs" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "blood_pressure_logs" DROP COLUMN "measured_date";--> statement-breakpoint
ALTER TABLE "blood_pressure_logs" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "body_composition_logs" DROP COLUMN "measured_date";--> statement-breakpoint
ALTER TABLE "body_composition_logs" DROP COLUMN "bmi_category";--> statement-breakpoint
ALTER TABLE "body_composition_logs" DROP COLUMN "body_fat_category";