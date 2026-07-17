import { getSupabaseServer } from "@/lib/database/client";

export interface UserGoal {
  userId: string;
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  targetDate?: string; // YYYY-MM-DD
  goalStartDate?: string; // YYYY-MM-DD
  goalNote?: string;
}

export interface GoalDBRow {
  user_id: string;
  target_weight_kg: number | null;
  target_body_fat_pct: number | null;
  target_date: string | null;
  goal_start_date: string | null;
  goal_note: string | null;
  created_at: string;
  updated_at: string;
}

export function mapGoalRowToDomain(row: GoalDBRow): UserGoal {
  return {
    userId: row.user_id,
    targetWeightKg: row.target_weight_kg ? Number(row.target_weight_kg) : undefined,
    targetBodyFatPercent: row.target_body_fat_pct ? Number(row.target_body_fat_pct) : undefined,
    targetDate: row.target_date ?? undefined,
    goalStartDate: row.goal_start_date ?? undefined,
    goalNote: row.goal_note ?? undefined,
  };
}

export class GoalRepository {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findByUserId(userId: string): Promise<UserGoal | null> {
    const { data, error } = await this.getSupabase()
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error in GoalRepository.findByUserId:", error);
      throw error;
    }
    return data ? mapGoalRowToDomain(data) : null;
  }

  async upsert(userId: string, data: Partial<Omit<UserGoal, "userId">>): Promise<UserGoal> {
    const payload: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (data.targetWeightKg !== undefined) payload.target_weight_kg = data.targetWeightKg ?? null;
    if (data.targetBodyFatPercent !== undefined) payload.target_body_fat_pct = data.targetBodyFatPercent ?? null;
    if (data.targetDate !== undefined) payload.target_date = data.targetDate || null;
    if (data.goalStartDate !== undefined) payload.goal_start_date = data.goalStartDate || null;
    if (data.goalNote !== undefined) payload.goal_note = data.goalNote || null;

    const { data: row, error } = await this.getSupabase()
      .from("user_goals")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error in GoalRepository.upsert:", error);
      throw error;
    }
    return mapGoalRowToDomain(row);
  }
}
