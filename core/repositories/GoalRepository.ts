import { db } from "@/db/client";
import { userGoals } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserGoal {
  userId: string;
  targetWeightKg?: number;
  targetBodyFatPercent?: number;
  targetDate?: string; // YYYY-MM-DD
  goalStartDate?: string; // YYYY-MM-DD
  goalNote?: string;
}

export function mapGoalRowToDomain(row: any): UserGoal {
  return {
    userId: row.userId,
    targetWeightKg: row.targetWeightKg ? Number(row.targetWeightKg) : undefined,
    targetBodyFatPercent: row.targetBodyFatPct ? Number(row.targetBodyFatPct) : undefined,
    targetDate: row.targetDate ?? undefined,
    goalStartDate: row.goalStartDate ?? undefined,
    goalNote: row.goalNote ?? undefined,
  };
}

export class GoalRepository {
  async findByUserId(userId: string): Promise<UserGoal | null> {
    try {
      const data = await db.select().from(userGoals).where(eq(userGoals.userId, userId)).limit(1);
      if (!data || data.length === 0) return null;
      return mapGoalRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in GoalRepository.findByUserId:", error);
      throw error;
    }
  }

  async upsert(userId: string, data: Partial<Omit<UserGoal, "userId">>): Promise<UserGoal> {
    try {
      const payload: Record<string, any> = {
        userId,
        updatedAt: new Date(),
      };

      if (data.targetWeightKg !== undefined) payload.targetWeightKg = data.targetWeightKg ? String(data.targetWeightKg) : null;
      if (data.targetBodyFatPercent !== undefined) payload.targetBodyFatPct = data.targetBodyFatPercent ? String(data.targetBodyFatPercent) : null;
      if (data.targetDate !== undefined) payload.targetDate = data.targetDate || null;
      if (data.goalStartDate !== undefined) payload.goalStartDate = data.goalStartDate || null;
      if (data.goalNote !== undefined) payload.goalNote = data.goalNote || null;

      const [row] = await db.insert(userGoals)
        .values(payload as any)
        .onConflictDoUpdate({
          target: userGoals.userId,
          set: payload
        })
        .returning();

      return mapGoalRowToDomain(row);
    } catch (error) {
      console.error("Error in GoalRepository.upsert:", error);
      throw error;
    }
  }
}
