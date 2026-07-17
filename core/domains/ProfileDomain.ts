import { ProfileRepository } from "@/core/repositories/ProfileRepository";
import { GoalRepository } from "@/core/repositories/GoalRepository";
import { PreferencesRepository } from "@/core/repositories/PreferencesRepository";
import { UserRepository } from "@/core/repositories/UserRepository";
import { AppSettings } from "@/lib/types";

export class ProfileDomain {
  private profileRepo = new ProfileRepository();
  private goalRepo = new GoalRepository();
  private preferencesRepo = new PreferencesRepository();
  private userRepo = new UserRepository();

  /**
   * Loads all user-specific profiles, goals, and units preferences in parallel
   * and aggregates them into a consolidated AppSettings domain object.
   */
  async getSettings(userId: string): Promise<AppSettings> {
    const [user, profile, goal, preferences] = await Promise.all([
      this.userRepo.findById(userId),
      this.profileRepo.findByUserId(userId),
      this.goalRepo.findByUserId(userId),
      this.preferencesRepo.findByUserId(userId),
    ]);

    return {
      name: user?.display_name ?? undefined,
      dateOfBirth: profile?.dateOfBirth,
      ageFallback: profile?.ageFallback,
      sex: profile?.sex,
      heightCm: profile?.heightCm,
      targetWeightKg: goal?.targetWeightKg,
      targetBodyFatPercent: goal?.targetBodyFatPercent,
      targetDate: goal?.targetDate,
      goalNote: goal?.goalNote,
      preferredWeightUnit: preferences?.weightUnit ?? "kg",
      preferredHeightUnit: preferences?.heightUnit ?? "cm",
      preferredGlucoseUnit: preferences?.glucoseUnit ?? "mg/dL",
      timezone: preferences?.timezone ?? "Asia/Kolkata",
      theme: preferences?.theme ?? "system",
      goalStartDate: goal?.goalStartDate,
    };
  }

  /**
   * Updates user records in parallel across users, profiles, goals, and preferences.
   * Cleans upsert inputs to ensure proper referential integrity.
   */
  async updateSettings(userId: string, settings: AppSettings): Promise<AppSettings> {
    await Promise.all([
      // 1. Update display name in core user record
      settings.name !== undefined
        ? this.userRepo.upsert({ id: userId, display_name: settings.name })
        : Promise.resolve(),

      // 2. Update profiles table
      this.profileRepo.upsert(userId, {
        dateOfBirth: settings.dateOfBirth,
        ageFallback: settings.ageFallback,
        sex: settings.sex,
        heightCm: settings.heightCm,
      }),

      // 3. Update goals table
      this.goalRepo.upsert(userId, {
        targetWeightKg: settings.targetWeightKg,
        targetBodyFatPercent: settings.targetBodyFatPercent,
        targetDate: settings.targetDate,
        goalNote: settings.goalNote,
        goalStartDate: settings.goalStartDate,
      }),

      // 4. Update preferences table
      this.preferencesRepo.upsert(userId, {
        weightUnit: settings.preferredWeightUnit,
        heightUnit: settings.preferredHeightUnit,
        glucoseUnit: settings.preferredGlucoseUnit,
        timezone: settings.timezone,
        theme: settings.theme,
      }),
    ]);

    return this.getSettings(userId);
  }
}
