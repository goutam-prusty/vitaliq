import { db } from "@/db/client";
import { users, userPreferences, userProfiles, userGoals } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserRow {
  id: string; // Clerk userId
  email?: string | null;
  display_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

function mapUser(dbUser: any): UserRow {
  return {
    id: dbUser.id,
    email: dbUser.email,
    display_name: dbUser.displayName,
    created_at: dbUser.createdAt?.toISOString(),
    updated_at: dbUser.updatedAt?.toISOString(),
  };
}

export class UserRepository {
  async findById(id: string): Promise<UserRow | null> {
    try {
      const data = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (!data || data.length === 0) return null;
      return mapUser(data[0]);
    } catch (error) {
      console.error("Error in UserRepository.findById:", error);
      throw error;
    }
  }

  async syncNewUser(user: UserRow): Promise<UserRow> {
    try {
      // 1. Sync Clerk user into users table
      const [newUser] = await db.insert(users).values({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          displayName: user.display_name,
          updatedAt: new Date(),
        }
      }).returning();

      // 2. Provision default preferences
      await db.insert(userPreferences).values({
        userId: user.id,
        weightUnit: "kg",
        heightUnit: "cm",
        glucoseUnit: "mg/dL",
        timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
        theme: "system",
      }).onConflictDoNothing({ target: userPreferences.userId });

      // 3. Provision default empty profile
      await db.insert(userProfiles).values({
        userId: user.id,
      }).onConflictDoNothing({ target: userProfiles.userId });

      // 4. Provision default empty goals
      await db.insert(userGoals).values({
        userId: user.id,
      }).onConflictDoNothing({ target: userGoals.userId });

      return mapUser(newUser);
    } catch (error) {
      console.error("Error in UserRepository.syncNewUser:", error);
      throw error;
    }
  }

  async upsert(user: UserRow): Promise<UserRow> {
    try {
      const [updated] = await db.insert(users).values({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          displayName: user.display_name,
          updatedAt: new Date(),
        }
      }).returning();
      
      return mapUser(updated);
    } catch (error) {
      console.error("Error in UserRepository.upsert:", error);
      throw error;
    }
  }
}
