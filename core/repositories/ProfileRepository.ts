import { getSupabaseServer } from "@/lib/database/client";

export interface UserProfile {
  userId: string;
  dateOfBirth?: string; // YYYY-MM-DD
  ageFallback?: number;
  sex?: "male" | "female" | "other" | "not_specified";
  heightCm?: number;
}

export interface ProfileDBRow {
  user_id: string;
  date_of_birth: string | null;
  age_fallback: number | null;
  sex: string | null;
  height_cm: number | null;
  created_at: string;
  updated_at: string;
}

export function mapProfileRowToDomain(row: ProfileDBRow): UserProfile {
  return {
    userId: row.user_id,
    dateOfBirth: row.date_of_birth ?? undefined,
    ageFallback: row.age_fallback ?? undefined,
    sex: (row.sex as UserProfile["sex"]) ?? undefined,
    heightCm: row.height_cm ? Number(row.height_cm) : undefined,
  };
}

export class ProfileRepository {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.getSupabase()
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error in ProfileRepository.findByUserId:", error);
      throw error;
    }
    return data ? mapProfileRowToDomain(data) : null;
  }

  async upsert(userId: string, data: Partial<Omit<UserProfile, "userId">>): Promise<UserProfile> {
    const payload: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (data.dateOfBirth !== undefined) payload.date_of_birth = data.dateOfBirth || null;
    if (data.ageFallback !== undefined) payload.age_fallback = data.ageFallback ?? null;
    if (data.sex !== undefined) payload.sex = data.sex || null;
    if (data.heightCm !== undefined) payload.height_cm = data.heightCm ?? null;

    const { data: row, error } = await this.getSupabase()
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error in ProfileRepository.upsert:", error);
      throw error;
    }
    return mapProfileRowToDomain(row);
  }
}
