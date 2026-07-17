import { db } from "@/db/client";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserProfile {
  userId: string;
  dateOfBirth?: string; // YYYY-MM-DD
  ageFallback?: number;
  sex?: "male" | "female" | "other" | "not_specified";
  heightCm?: number;
}

export function mapProfileRowToDomain(row: any): UserProfile {
  return {
    userId: row.userId,
    dateOfBirth: row.dateOfBirth ?? undefined,
    ageFallback: row.ageFallback ?? undefined,
    sex: (row.sex as UserProfile["sex"]) ?? undefined,
    heightCm: row.heightCm ? Number(row.heightCm) : undefined,
  };
}

export class ProfileRepository {
  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const data = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
      if (!data || data.length === 0) return null;
      return mapProfileRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in ProfileRepository.findByUserId:", error);
      throw error;
    }
  }

  async upsert(userId: string, data: Partial<Omit<UserProfile, "userId">>): Promise<UserProfile> {
    try {
      const payload: Record<string, any> = {
        userId,
        updatedAt: new Date(),
      };

      if (data.dateOfBirth !== undefined) payload.dateOfBirth = data.dateOfBirth || null;
      if (data.ageFallback !== undefined) payload.ageFallback = data.ageFallback ?? null;
      if (data.sex !== undefined) payload.sex = data.sex || null;
      if (data.heightCm !== undefined) payload.heightCm = data.heightCm ? String(data.heightCm) : null;

      const [row] = await db.insert(userProfiles)
        .values(payload as any)
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: payload
        })
        .returning();

      return mapProfileRowToDomain(row);
    } catch (error) {
      console.error("Error in ProfileRepository.upsert:", error);
      throw error;
    }
  }
}
