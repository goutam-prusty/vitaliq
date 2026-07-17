"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { HealthDomain } from "@/core/domains/HealthDomain";
import { bodyInputSchema, pressureInputSchema, glucoseInputSchema } from "@/lib/validation";
import { LogKind, HealthRecord } from "@/lib/types";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; validationErrors?: Record<string, string[]> };

const healthDomain = new HealthDomain();

/**
 * Server Action to create a new health record.
 */
export async function createRecordAction(kind: LogKind, rawData: unknown): Promise<ActionResponse<HealthRecord>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Zod input validation
  let validatedData;
  try {
    if (kind === "body") {
      validatedData = bodyInputSchema.parse(rawData);
    } else if (kind === "pressure") {
      validatedData = pressureInputSchema.parse(rawData);
    } else if (kind === "glucose") {
      validatedData = glucoseInputSchema.parse(rawData);
    } else {
      return { success: false, error: `Invalid record kind: ${kind}` };
    }
  } catch (error: any) {
    return {
      success: false,
      error: "Validation failed",
      validationErrors: error.flatten?.().fieldErrors,
    };
  }

  // 2. Business logic delegation
  try {
    const record = await healthDomain.createRecord(userId, kind, validatedData);
    
    // 3. Cache purging
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/trends");
    
    return { success: true, data: record };
  } catch (error: any) {
    console.error(`Error in createRecordAction for ${kind}:`, error);
    return { success: false, error: error.message || "Failed to create record" };
  }
}

/**
 * Server Action to update an existing health record.
 */
export async function updateRecordAction(kind: LogKind, id: string, rawData: unknown): Promise<ActionResponse<HealthRecord>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "Record ID is required" };
  }

  // 1. Zod input validation
  let validatedData;
  try {
    if (kind === "body") {
      validatedData = bodyInputSchema.parse(rawData);
    } else if (kind === "pressure") {
      validatedData = pressureInputSchema.parse(rawData);
    } else if (kind === "glucose") {
      validatedData = glucoseInputSchema.parse(rawData);
    } else {
      return { success: false, error: `Invalid record kind: ${kind}` };
    }
  } catch (error: any) {
    return {
      success: false,
      error: "Validation failed",
      validationErrors: error.flatten?.().fieldErrors,
    };
  }

  // 2. Business logic delegation
  try {
    const record = await healthDomain.updateRecord(userId, kind, id, validatedData);
    
    // 3. Cache purging
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/trends");
    
    return { success: true, data: record };
  } catch (error: any) {
    console.error(`Error in updateRecordAction for ${kind}:`, error);
    return { success: false, error: error.message || "Failed to update record" };
  }
}

/**
 * Server Action to delete a health record.
 */
export async function deleteRecordAction(kind: LogKind, id: string): Promise<ActionResponse<boolean>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "Record ID is required" };
  }

  try {
    const success = await healthDomain.deleteRecord(userId, kind, id);
    
    // Cache purging
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/trends");
    
    return { success: true, data: success };
  } catch (error: any) {
    console.error(`Error in deleteRecordAction for ${kind}:`, error);
    return { success: false, error: error.message || "Failed to delete record" };
  }
}
