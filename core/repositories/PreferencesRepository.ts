import { getSupabaseServer } from "@/lib/database/client";
import { WeightUnit, HeightUnit, GlucoseUnit } from "@/lib/types";

export interface UserPreferences {
  userId: string;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  glucoseUnit: GlucoseUnit;
  timezone: string;
  theme: "system" | "light" | "dark";
}

export interface PreferencesDBRow {
  user_id: string;
  weight_unit: string;
  height_unit: string;
  glucose_unit: string;
  timezone: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export function mapPreferencesRowToDomain(row: PreferencesDBRow): UserPreferences {
  return {
    userId: row.user_id,
    weightUnit: row.weight_unit as WeightUnit,
    heightUnit: row.height_unit as HeightUnit,
    glucoseUnit: row.glucose_unit as GlucoseUnit,
    timezone: row.timezone,
    theme: row.theme as UserPreferences["theme"],
  };
}

export class PreferencesRepository {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.getSupabase()
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error in PreferencesRepository.findByUserId:", error);
      throw error;
    }
    return data ? mapPreferencesRowToDomain(data) : null;
  }

  async upsert(userId: string, data: Partial<Omit<UserPreferences, "userId">>): Promise<UserPreferences> {
    const payload: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (data.weightUnit !== undefined) payload.weight_unit = data.weightUnit;
    if (data.heightUnit !== undefined) payload.height_unit = data.heightUnit;
    if (data.glucoseUnit !== undefined) payload.glucose_unit = data.glucoseUnit;
    if (data.timezone !== undefined) payload.timezone = data.timezone;
    if (data.theme !== undefined) payload.theme = data.theme;

    const { data: row, error } = await this.getSupabase()
      .from("user_preferences")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error in PreferencesRepository.upsert:", error);
      throw error;
    }
    return mapPreferencesRowToDomain(row);
  }
}
