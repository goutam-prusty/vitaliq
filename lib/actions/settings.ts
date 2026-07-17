"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { settingsSchema } from "@/lib/settings";
import { AppSettings } from "@/lib/types";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: Record<string, string[]> };

const profileDomain = new ProfileDomain();

/**
 * Server Action to update user settings.
 */
export async function updateSettingsAction(rawSettings: unknown): Promise<ActionResponse<AppSettings>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Zod input validation
  let validatedSettings;
  try {
    validatedSettings = settingsSchema.parse(rawSettings);
  } catch (error: any) {
    return {
      success: false,
      error: "Validation failed",
      validationErrors: error.flatten?.().fieldErrors,
    };
  }

  // 2. Business logic delegation
  try {
    const updated = await profileDomain.updateSettings(userId, validatedSettings as AppSettings);
    
    // 3. Cache purging
    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/history");
    
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in updateSettingsAction server action:", error);
    return { success: false, error: error.message || "Failed to save settings." };
  }
}
