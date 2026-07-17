import { BaseRepository, QueryFilters } from "./BaseRepository";
import { BodyRecord } from "@/lib/types";
import { db } from "@/db/client";
import { bodyCompositionLogs } from "@/db/schema";
import { eq, and, desc, gte, lte, ilike, lt } from "drizzle-orm";
import { makeTimestamp } from "@/lib/dates";

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

export function mapBodyRowToDomain(row: any): BodyRecord {
  // row.measuredAt is a Date in drizzle schema for timestamp
  const dateObj = new Date(row.measuredAt);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "body",
    date: row.measuredDate,
    time: timeStr,
    timestamp: row.measuredAt.toISOString(),
    notes: row.notes ?? undefined,
    weightKg: Number(row.weightKg),
    bmi: row.bmi ? Number(row.bmi) : undefined,
    bodyFatPercent: row.bodyFatPct ? Number(row.bodyFatPct) : undefined,
    muscleRatePercent: row.muscleRatePct ? Number(row.muscleRatePct) : undefined,
    bodyWaterPercent: row.bodyWaterPct ? Number(row.bodyWaterPct) : undefined,
    boneMassKg: row.boneMassKg ? Number(row.boneMassKg) : undefined,
    bmrKcal: row.bmrKcal ?? undefined,
    metabolicAge: row.metabolicAge ?? undefined,
    visceralFatPercent: row.visceralFatPct ? Number(row.visceralFatPct) : undefined,
    subcutaneousFatPercent: row.subcutaneousFatPct ? Number(row.subcutaneousFatPct) : undefined,
    proteinMassKg: row.proteinMassKg ? Number(row.proteinMassKg) : undefined,
    muscleMassKg: row.muscleMassKg ? Number(row.muscleMassKg) : undefined,
    weightWithoutFatKg: row.weightWithoutFatKg ? Number(row.weightWithoutFatKg) : undefined,
    obesityLevel: row.obesityLevel ?? undefined,
    skeletalMuscleMassKg: row.skeletalMuscleMassKg ? Number(row.skeletalMuscleMassKg) : undefined,
    bmiCategory: row.bmiCategory ?? undefined,
    bodyFatCategory: row.bodyFatCategory ?? undefined,
  };
}

export class BodyRepository implements BaseRepository<BodyRecord, BodyRecordInput, Partial<BodyRecordInput>> {
  async findById(userId: string, id: string): Promise<BodyRecord | null> {
    try {
      const data = await db.select().from(bodyCompositionLogs).where(
        and(eq(bodyCompositionLogs.userId, userId), eq(bodyCompositionLogs.id, id))
      ).limit(1);

      if (!data || data.length === 0) return null;
      return mapBodyRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in BodyRepository.findById:", error);
      throw error;
    }
  }

  async findMany(filters: QueryFilters): Promise<BodyRecord[]> {
    try {
      const conditions = [eq(bodyCompositionLogs.userId, filters.userId)];

      if (filters.from) conditions.push(gte(bodyCompositionLogs.measuredAt, new Date(filters.from)));
      if (filters.to) conditions.push(lte(bodyCompositionLogs.measuredAt, new Date(filters.to)));
      if (filters.search) conditions.push(ilike(bodyCompositionLogs.notes, `%${filters.search}%`));
      if (filters.cursor) conditions.push(lt(bodyCompositionLogs.measuredAt, new Date(filters.cursor)));

      const query = db.select().from(bodyCompositionLogs)
        .where(and(...conditions))
        .orderBy(desc(bodyCompositionLogs.measuredAt));

      if (filters.limit) {
        query.limit(filters.limit);
      }

      const data = await query;
      return data.map(mapBodyRowToDomain);
    } catch (error) {
      console.error("Error in BodyRepository.findMany:", error);
      throw error;
    }
  }

  async create(userId: string, data: BodyRecordInput): Promise<BodyRecord> {
    try {
      const measuredAt = new Date(makeTimestamp(data.date, data.time));
      
      const payload: any = {
        userId,
        measuredAt,
        weightKg: String(data.weightKg),
        bmi: data.bmi !== undefined ? String(data.bmi) : null,
        bodyFatPct: data.bodyFatPercent !== undefined ? String(data.bodyFatPercent) : null,
        muscleRatePct: data.muscleRatePercent !== undefined ? String(data.muscleRatePercent) : null,
        bodyWaterPct: data.bodyWaterPercent !== undefined ? String(data.bodyWaterPercent) : null,
        boneMassKg: data.boneMassKg !== undefined ? String(data.boneMassKg) : null,
        bmrKcal: data.bmrKcal ?? null,
        metabolicAge: data.metabolicAge ?? null,
        visceralFatPct: data.visceralFatPercent !== undefined ? String(data.visceralFatPercent) : null,
        subcutaneousFatPct: data.subcutaneousFatPercent !== undefined ? String(data.subcutaneousFatPercent) : null,
        proteinMassKg: data.proteinMassKg !== undefined ? String(data.proteinMassKg) : null,
        muscleMassKg: data.muscleMassKg !== undefined ? String(data.muscleMassKg) : null,
        weightWithoutFatKg: data.weightWithoutFatKg !== undefined ? String(data.weightWithoutFatKg) : null,
        obesityLevel: data.obesityLevel ?? null,
        skeletalMuscleMassKg: data.skeletalMuscleMassKg !== undefined ? String(data.skeletalMuscleMassKg) : null,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      };

      const [row] = await db.insert(bodyCompositionLogs).values(payload).returning();
      return mapBodyRowToDomain(row);
    } catch (error) {
      console.error("Error in BodyRepository.create:", error);
      throw error;
    }
  }

  async update(userId: string, id: string, data: Partial<BodyRecordInput>): Promise<BodyRecord> {
    try {
      const updatePayload: Record<string, any> = {};

      if (data.date !== undefined || data.time !== undefined) {
        if (data.date === undefined || data.time === undefined) {
          throw new Error("Both date and time must be provided when updating the timestamp.");
        }
        updatePayload.measuredAt = new Date(makeTimestamp(data.date, data.time));
      }

      if (data.weightKg !== undefined) updatePayload.weightKg = String(data.weightKg);
      if (data.bmi !== undefined) updatePayload.bmi = data.bmi ? String(data.bmi) : null;
      if (data.bodyFatPercent !== undefined) updatePayload.bodyFatPct = data.bodyFatPercent ? String(data.bodyFatPercent) : null;
      if (data.muscleRatePercent !== undefined) updatePayload.muscleRatePct = data.muscleRatePercent ? String(data.muscleRatePercent) : null;
      if (data.bodyWaterPercent !== undefined) updatePayload.bodyWaterPct = data.bodyWaterPercent ? String(data.bodyWaterPercent) : null;
      if (data.boneMassKg !== undefined) updatePayload.boneMassKg = data.boneMassKg ? String(data.boneMassKg) : null;
      if (data.bmrKcal !== undefined) updatePayload.bmrKcal = data.bmrKcal;
      if (data.metabolicAge !== undefined) updatePayload.metabolicAge = data.metabolicAge;
      if (data.visceralFatPercent !== undefined) updatePayload.visceralFatPct = data.visceralFatPercent ? String(data.visceralFatPercent) : null;
      if (data.subcutaneousFatPercent !== undefined) updatePayload.subcutaneousFatPct = data.subcutaneousFatPercent ? String(data.subcutaneousFatPercent) : null;
      if (data.proteinMassKg !== undefined) updatePayload.proteinMassKg = data.proteinMassKg ? String(data.proteinMassKg) : null;
      if (data.muscleMassKg !== undefined) updatePayload.muscleMassKg = data.muscleMassKg ? String(data.muscleMassKg) : null;
      if (data.weightWithoutFatKg !== undefined) updatePayload.weightWithoutFatKg = data.weightWithoutFatKg ? String(data.weightWithoutFatKg) : null;
      if (data.obesityLevel !== undefined) updatePayload.obesityLevel = data.obesityLevel;
      if (data.skeletalMuscleMassKg !== undefined) updatePayload.skeletalMuscleMassKg = data.skeletalMuscleMassKg ? String(data.skeletalMuscleMassKg) : null;
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.source !== undefined) updatePayload.source = data.source;

      updatePayload.updatedAt = new Date();

      const [row] = await db.update(bodyCompositionLogs)
        .set(updatePayload)
        .where(and(eq(bodyCompositionLogs.userId, userId), eq(bodyCompositionLogs.id, id)))
        .returning();

      if (!row) throw new Error("Not found");

      return mapBodyRowToDomain(row);
    } catch (error) {
      console.error("Error in BodyRepository.update:", error);
      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    try {
      const [row] = await db.delete(bodyCompositionLogs)
        .where(and(eq(bodyCompositionLogs.userId, userId), eq(bodyCompositionLogs.id, id)))
        .returning({ id: bodyCompositionLogs.id });
        
      return !!row;
    } catch (error) {
      console.error("Error in BodyRepository.delete:", error);
      throw error;
    }
  }
}
