import { db } from "@/db/client";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WeightUnit, HeightUnit, GlucoseUnit } from "@/lib/types";

export interface UserPreferences {
  userId: string;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  glucoseUnit: GlucoseUnit;
  timezone: string;
  theme: "system" | "light" | "dark";
}

export function mapPreferencesRowToDomain(row: any): UserPreferences {
  return {
    userId: row.userId,
    weightUnit: row.weightUnit as WeightUnit,
    heightUnit: row.heightUnit as HeightUnit,
    glucoseUnit: row.glucoseUnit as GlucoseUnit,
    timezone: row.timezone,
    theme: row.theme as UserPreferences["theme"],
  };
}

export class PreferencesRepository {
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    try {
      const data = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
      if (!data || data.length === 0) return null;
      return mapPreferencesRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in PreferencesRepository.findByUserId:", error);
      throw error;
    }
  }

  async upsert(userId: string, data: Partial<Omit<UserPreferences, "userId">>): Promise<UserPreferences> {
    try {
      const payload: Record<string, any> = {
        userId,
        updatedAt: new Date(),
      };

      if (data.weightUnit !== undefined) payload.weightUnit = data.weightUnit;
      if (data.heightUnit !== undefined) payload.heightUnit = data.heightUnit;
      if (data.glucoseUnit !== undefined) payload.glucoseUnit = data.glucoseUnit;
      if (data.timezone !== undefined) payload.timezone = data.timezone;
      if (data.theme !== undefined) payload.theme = data.theme;

      const [row] = await db.insert(userPreferences)
        .values(payload as any)
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: payload
        })
        .returning();

      return mapPreferencesRowToDomain(row);
    } catch (error) {
      console.error("Error in PreferencesRepository.upsert:", error);
      throw error;
    }
  }
}
