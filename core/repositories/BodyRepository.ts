import { BaseRepository, QueryFilters } from "./BaseRepository";
import { BodyRecord } from "@/lib/types";
import { getSupabaseServer } from "@/lib/database/client";
import { makeTimestamp } from "@/lib/dates";

export interface BodyDBRow {
  id: string;
  user_id: string;
  measured_at: string;
  measured_date: string;
  weight_kg: number;
  bmi: number | null;
  body_fat_pct: number | null;
  muscle_rate_pct: number | null;
  body_water_pct: number | null;
  bone_mass_kg: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
  visceral_fat_pct: number | null;
  subcutaneous_fat_pct: number | null;
  protein_mass_kg: number | null;
  muscle_mass_kg: number | null;
  weight_without_fat_kg: number | null;
  obesity_level: string | null;
  skeletal_muscle_mass_kg: number | null;
  bmi_category: string | null;
  body_fat_category: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export type BodyRecordInput = {
  date: string;
  time: string;
  weightKg: number;
  bmi?: number;
  bodyFatPercent?: number;
  muscleRatePercent?: number;
  bodyWaterPercent?: number;
  boneMassKg?: number;
  bmrKcal?: number;
  metabolicAge?: number;
  visceralFatPercent?: number;
  subcutaneousFatPercent?: number;
  proteinMassKg?: number;
  muscleMassKg?: number;
  weightWithoutFatKg?: number;
  obesityLevel?: string;
  skeletalMuscleMassKg?: number;
  notes?: string;
  source?: string;
};

export function mapBodyRowToDomain(row: BodyDBRow): BodyRecord {
  const dateObj = new Date(row.measured_at);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "body",
    date: row.measured_date,
    time: timeStr,
    timestamp: row.measured_at,
    notes: row.notes ?? undefined,
    weightKg: row.weight_kg,
    bmi: row.bmi ?? undefined,
    bodyFatPercent: row.body_fat_pct ?? undefined,
    muscleRatePercent: row.muscle_rate_pct ?? undefined,
    bodyWaterPercent: row.body_water_pct ?? undefined,
    boneMassKg: row.bone_mass_kg ?? undefined,
    bmrKcal: row.bmr_kcal ?? undefined,
    metabolicAge: row.metabolic_age ?? undefined,
    visceralFatPercent: row.visceral_fat_pct ?? undefined,
    subcutaneousFatPercent: row.subcutaneous_fat_pct ?? undefined,
    proteinMassKg: row.protein_mass_kg ?? undefined,
    muscleMassKg: row.muscle_mass_kg ?? undefined,
    weightWithoutFatKg: row.weight_without_fat_kg ?? undefined,
    obesityLevel: row.obesity_level ?? undefined,
    skeletalMuscleMassKg: row.skeletal_muscle_mass_kg ?? undefined,
    bmiCategory: row.bmi_category ?? undefined,
    bodyFatCategory: row.body_fat_category ?? undefined,
  };
}

export class BodyRepository implements BaseRepository<BodyRecord, BodyRecordInput, Partial<BodyRecordInput>> {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findById(userId: string, id: string): Promise<BodyRecord | null> {
    const { data, error } = await this.getSupabase()
      .from("body_composition_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error in BodyRepository.findById:", error);
      throw error;
    }
    return data ? mapBodyRowToDomain(data) : null;
  }

  async findMany(filters: QueryFilters): Promise<BodyRecord[]> {
    let query = this.getSupabase()
      .from("body_composition_logs")
      .select("*")
      .eq("user_id", filters.userId)
      .order("measured_at", { ascending: false });

    if (filters.from) {
      query = query.gte("measured_at", filters.from);
    }
    if (filters.to) {
      query = query.lte("measured_at", filters.to);
    }
    if (filters.search) {
      query = query.ilike("notes", `%${filters.search}%`);
    }
    if (filters.cursor) {
      query = query.lt("measured_at", filters.cursor);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error in BodyRepository.findMany:", error);
      throw error;
    }

    return (data as BodyDBRow[]).map(mapBodyRowToDomain);
  }

  async create(userId: string, data: BodyRecordInput): Promise<BodyRecord> {
    const measuredAt = makeTimestamp(data.date, data.time);
    
    const { data: row, error } = await this.getSupabase()
      .from("body_composition_logs")
      .insert({
        user_id: userId,
        measured_at: measuredAt,
        weight_kg: data.weightKg,
        bmi: data.bmi ?? null,
        body_fat_pct: data.bodyFatPercent ?? null,
        muscle_rate_pct: data.muscleRatePercent ?? null,
        body_water_pct: data.bodyWaterPercent ?? null,
        bone_mass_kg: data.boneMassKg ?? null,
        bmr_kcal: data.bmrKcal ?? null,
        metabolic_age: data.metabolicAge ?? null,
        visceral_fat_pct: data.visceralFatPercent ?? null,
        subcutaneous_fat_pct: data.subcutaneousFatPercent ?? null,
        protein_mass_kg: data.proteinMassKg ?? null,
        muscle_mass_kg: data.muscleMassKg ?? null,
        weight_without_fat_kg: data.weightWithoutFatKg ?? null,
        obesity_level: data.obesityLevel ?? null,
        skeletal_muscle_mass_kg: data.skeletalMuscleMassKg ?? null,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      })
      .select()
      .single();

    if (error) {
      console.error("Error in BodyRepository.create:", error);
      throw error;
    }

    return mapBodyRowToDomain(row);
  }

  async update(userId: string, id: string, data: Partial<BodyRecordInput>): Promise<BodyRecord> {
    const updatePayload: Record<string, any> = {};

    if (data.date !== undefined || data.time !== undefined) {
      // If updating date/time, we must have both to build measured_at correctly
      if (data.date === undefined || data.time === undefined) {
        throw new Error("Both date and time must be provided when updating the timestamp.");
      }
      updatePayload.measured_at = makeTimestamp(data.date, data.time);
    }

    if (data.weightKg !== undefined) updatePayload.weight_kg = data.weightKg;
    if (data.bmi !== undefined) updatePayload.bmi = data.bmi;
    if (data.bodyFatPercent !== undefined) updatePayload.body_fat_pct = data.bodyFatPercent;
    if (data.muscleRatePercent !== undefined) updatePayload.muscle_rate_pct = data.muscleRatePercent;
    if (data.bodyWaterPercent !== undefined) updatePayload.body_water_pct = data.bodyWaterPercent;
    if (data.boneMassKg !== undefined) updatePayload.bone_mass_kg = data.boneMassKg;
    if (data.bmrKcal !== undefined) updatePayload.bmr_kcal = data.bmrKcal;
    if (data.metabolicAge !== undefined) updatePayload.metabolic_age = data.metabolicAge;
    if (data.visceralFatPercent !== undefined) updatePayload.visceral_fat_pct = data.visceralFatPercent;
    if (data.subcutaneousFatPercent !== undefined) updatePayload.subcutaneous_fat_pct = data.subcutaneousFatPercent;
    if (data.proteinMassKg !== undefined) updatePayload.protein_mass_kg = data.proteinMassKg;
    if (data.muscleMassKg !== undefined) updatePayload.muscle_mass_kg = data.muscleMassKg;
    if (data.weightWithoutFatKg !== undefined) updatePayload.weight_without_fat_kg = data.weightWithoutFatKg;
    if (data.obesityLevel !== undefined) updatePayload.obesity_level = data.obesityLevel;
    if (data.skeletalMuscleMassKg !== undefined) updatePayload.skeletal_muscle_mass_kg = data.skeletalMuscleMassKg;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.source !== undefined) updatePayload.source = data.source;

    updatePayload.updated_at = new Date().toISOString();

    const { data: row, error } = await this.getSupabase()
      .from("body_composition_logs")
      .update(updatePayload)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error in BodyRepository.update:", error);
      throw error;
    }

    return mapBodyRowToDomain(row);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.getSupabase()
      .from("body_composition_logs")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) {
      console.error("Error in BodyRepository.delete:", error);
      throw error;
    }
    return true;
  }
}
