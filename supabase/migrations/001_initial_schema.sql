-- ============================================================
-- USERS (minimal register synced from Clerk)
-- ============================================================
CREATE TABLE users (
  id            TEXT PRIMARY KEY, -- Clerk userId directly
  email         TEXT,
  display_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER PROFILES (internal user-editable stats)
-- ============================================================
CREATE TABLE user_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  date_of_birth     DATE,
  age_fallback      SMALLINT CHECK (age_fallback BETWEEN 0 AND 130),
  sex               TEXT CHECK (sex IN ('male', 'female', 'other', 'not_specified')),
  height_cm         NUMERIC(5, 1) CHECK (height_cm > 0 AND height_cm <= 260),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================================
-- USER GOALS
-- ============================================================
CREATE TABLE user_goals (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_weight_kg       NUMERIC(5, 1) CHECK (target_weight_kg > 0 AND target_weight_kg <= 500),
  target_body_fat_pct    NUMERIC(4, 1) CHECK (target_body_fat_pct BETWEEN 0 AND 100),
  target_date            DATE,
  goal_start_date        DATE,
  goal_note              TEXT CHECK (char_length(goal_note) <= 500),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE user_preferences (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  weight_unit            TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  height_unit            TEXT NOT NULL DEFAULT 'cm' CHECK (height_unit IN ('cm', 'ft-in')),
  glucose_unit           TEXT NOT NULL DEFAULT 'mg/dL' CHECK (glucose_unit IN ('mg/dL', 'mmol/L')),
  timezone               TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  theme                  TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================================
-- BODY COMPOSITION LOGS
-- ============================================================
CREATE TABLE body_composition_logs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  measured_at              TIMESTAMPTZ NOT NULL,
  measured_date            DATE NOT NULL GENERATED ALWAYS AS (measured_at::date) STORED,
  weight_kg                NUMERIC(5, 1) NOT NULL CHECK (weight_kg > 0 AND weight_kg <= 500),
  bmi                      NUMERIC(4, 1),
  body_fat_pct             NUMERIC(4, 1),
  muscle_rate_pct          NUMERIC(4, 1),
  body_water_pct           NUMERIC(4, 1),
  bone_mass_kg             NUMERIC(4, 2),
  bmr_kcal                 INTEGER,
  metabolic_age            SMALLINT,
  visceral_fat_pct         NUMERIC(4, 1),
  subcutaneous_fat_pct     NUMERIC(4, 1),
  protein_mass_kg          NUMERIC(4, 2),
  muscle_mass_kg           NUMERIC(5, 1),
  weight_without_fat_kg    NUMERIC(5, 1),
  obesity_level            TEXT,
  skeletal_muscle_mass_kg  NUMERIC(5, 1),
  
  -- Computed categories
  bmi_category             TEXT GENERATED ALWAYS AS (
    CASE
      WHEN bmi IS NULL THEN NULL
      WHEN bmi < 18.5 THEN 'Underweight'
      WHEN bmi < 25 THEN 'Normal'
      WHEN bmi < 30 THEN 'Overweight'
      ELSE 'Obese'
    END
  ) STORED,
  body_fat_category        TEXT GENERATED ALWAYS AS (
    CASE
      WHEN body_fat_pct IS NULL THEN NULL
      WHEN body_fat_pct < 6 THEN 'Essential Fat'
      WHEN body_fat_pct < 14 THEN 'Athletic'
      WHEN body_fat_pct < 18 THEN 'Fitness'
      WHEN body_fat_pct < 25 THEN 'Average'
      ELSE 'Obese'
    END
  ) STORED,
  
  notes                    TEXT CHECK (char_length(notes) <= 1000),
  source                   TEXT DEFAULT 'manual',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing user_id and measured_at for standard historical queries
CREATE INDEX idx_body_user_time ON body_composition_logs (user_id, measured_at DESC);
CREATE INDEX idx_body_user_date ON body_composition_logs (user_id, measured_date DESC);

-- ============================================================
-- BLOOD PRESSURE LOGS
-- ============================================================
CREATE TABLE blood_pressure_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  measured_at   TIMESTAMPTZ NOT NULL,
  measured_date DATE NOT NULL GENERATED ALWAYS AS (measured_at::date) STORED,
  systolic      SMALLINT NOT NULL CHECK (systolic > 0 AND systolic <= 400),
  diastolic     SMALLINT NOT NULL CHECK (diastolic > 0 AND diastolic <= 250),
  pulse         SMALLINT CHECK (pulse > 0 AND pulse <= 300),
  
  -- Computed category
  category      TEXT GENERATED ALWAYS AS (
    CASE
      WHEN systolic >= 140 OR diastolic >= 90 THEN 'Hypertension Stage 2'
      WHEN systolic >= 130 OR diastolic >= 80 THEN 'Hypertension Stage 1'
      WHEN systolic >= 120 AND systolic < 130 AND diastolic < 80 THEN 'Elevated'
      ELSE 'Normal'
    END
  ) STORED,
  
  notes         TEXT CHECK (char_length(notes) <= 1000),
  source        TEXT DEFAULT 'manual',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing user_id and measured_at for standard historical queries
CREATE INDEX idx_bp_user_time ON blood_pressure_logs (user_id, measured_at DESC);
CREATE INDEX idx_bp_user_date ON blood_pressure_logs (user_id, measured_date DESC);

-- ============================================================
-- BLOOD GLUCOSE LOGS
-- ============================================================
CREATE TABLE blood_glucose_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  measured_at   TIMESTAMPTZ NOT NULL,
  measured_date DATE NOT NULL GENERATED ALWAYS AS (measured_at::date) STORED,
  glucose_mg_dl SMALLINT NOT NULL CHECK (glucose_mg_dl > 0 AND glucose_mg_dl <= 1000),
  
  -- Computed category
  category      TEXT GENERATED ALWAYS AS (
    CASE
      WHEN glucose_mg_dl >= 126 THEN 'Diabetes'
      WHEN glucose_mg_dl >= 100 THEN 'Prediabetes'
      ELSE 'Normal'
    END
  ) STORED,
  
  notes         TEXT CHECK (char_length(notes) <= 1000),
  source        TEXT DEFAULT 'manual',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing user_id and measured_at for standard historical queries
CREATE INDEX idx_glucose_user_time ON blood_glucose_logs (user_id, measured_at DESC);
CREATE INDEX idx_glucose_user_date ON blood_glucose_logs (user_id, measured_date DESC);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_composition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_glucose_logs ENABLE ROW LEVEL SECURITY;

-- Users: direct match on primary key (clerk_id) against auth JWT sub
CREATE POLICY users_own ON users
  FOR ALL USING (id = auth.jwt() ->> 'sub');

-- Profile, Goals, Preferences: direct match on user_id (clerk_id)
CREATE POLICY profiles_own ON user_profiles
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY goals_own ON user_goals
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY preferences_own ON user_preferences
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Measurement logs: direct match on user_id (clerk_id)
CREATE POLICY body_own ON body_composition_logs
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY bp_own ON blood_pressure_logs
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY glucose_own ON blood_glucose_logs
  FOR ALL USING (user_id = auth.jwt() ->> 'sub');
