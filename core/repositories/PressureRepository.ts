import { BaseRepository, QueryFilters } from "./BaseRepository";
import { PressureRecord } from "@/lib/types";
import { db } from "@/db/client";
import { bloodPressureLogs } from "@/db/schema";
import { eq, and, desc, gte, lte, ilike, lt } from "drizzle-orm";
import { makeTimestamp } from "@/lib/dates";

export type PressureRecordInput = {
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  source?: string;
};

function getPressureCategory(systolic: number, diastolic: number): string {
  if (systolic >= 140 || diastolic >= 90) return 'Hypertension Stage 2';
  if (systolic >= 130 || diastolic >= 80) return 'Hypertension Stage 1';
  if (systolic >= 120 && systolic < 130 && diastolic < 80) return 'Elevated';
  return 'Normal';
}

function getMeasuredDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function mapPressureRowToDomain(row: any): PressureRecord {
  const dateObj = new Date(row.measuredAt);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "pressure",
    date: getMeasuredDate(dateObj),
    time: timeStr,
    timestamp: row.measuredAt.toISOString(),
    notes: row.notes ?? undefined,
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse ?? undefined,
    category: getPressureCategory(row.systolic, row.diastolic),
  };
}

export class PressureRepository implements BaseRepository<PressureRecord, PressureRecordInput, Partial<PressureRecordInput>> {
  async findById(userId: string, id: string): Promise<PressureRecord | null> {
    try {
      const data = await db.select().from(bloodPressureLogs).where(
        and(eq(bloodPressureLogs.userId, userId), eq(bloodPressureLogs.id, id))
      ).limit(1);

      if (!data || data.length === 0) return null;
      return mapPressureRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in PressureRepository.findById:", error);
      throw error;
    }
  }

  async findMany(filters: QueryFilters): Promise<PressureRecord[]> {
    try {
      const conditions = [eq(bloodPressureLogs.userId, filters.userId)];

      if (filters.from) conditions.push(gte(bloodPressureLogs.measuredAt, new Date(filters.from)));
      if (filters.to) conditions.push(lte(bloodPressureLogs.measuredAt, new Date(filters.to)));
      if (filters.search) conditions.push(ilike(bloodPressureLogs.notes, `%${filters.search}%`));
      if (filters.cursor) conditions.push(lt(bloodPressureLogs.measuredAt, new Date(filters.cursor)));

      const query = db.select().from(bloodPressureLogs)
        .where(and(...conditions))
        .orderBy(desc(bloodPressureLogs.measuredAt));

      if (filters.limit) {
        query.limit(filters.limit);
      }

      const data = await query;
      return data.map(mapPressureRowToDomain);
    } catch (error) {
      console.error("Error in PressureRepository.findMany:", error);
      throw error;
    }
  }

  async create(userId: string, data: PressureRecordInput): Promise<PressureRecord> {
    try {
      const measuredAt = new Date(makeTimestamp(data.date, data.time));
      
      const payload: any = {
        userId,
        measuredAt,
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse ?? null,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      };

      const [row] = await db.insert(bloodPressureLogs).values(payload).returning();
      return mapPressureRowToDomain(row);
    } catch (error) {
      console.error("Error in PressureRepository.create:", error);
      throw error;
    }
  }

  async update(userId: string, id: string, data: Partial<PressureRecordInput>): Promise<PressureRecord> {
    try {
      const updatePayload: Record<string, any> = {};

      if (data.date !== undefined || data.time !== undefined) {
        if (data.date === undefined || data.time === undefined) {
          throw new Error("Both date and time must be provided when updating the timestamp.");
        }
        updatePayload.measuredAt = new Date(makeTimestamp(data.date, data.time));
      }

      if (data.systolic !== undefined) updatePayload.systolic = data.systolic;
      if (data.diastolic !== undefined) updatePayload.diastolic = data.diastolic;
      if (data.pulse !== undefined) updatePayload.pulse = data.pulse;
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.source !== undefined) updatePayload.source = data.source;

      updatePayload.updatedAt = new Date();

      const [row] = await db.update(bloodPressureLogs)
        .set(updatePayload)
        .where(and(eq(bloodPressureLogs.userId, userId), eq(bloodPressureLogs.id, id)))
        .returning();

      if (!row) throw new Error("Not found");

      return mapPressureRowToDomain(row);
    } catch (error) {
      console.error("Error in PressureRepository.update:", error);
      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    try {
      const [row] = await db.delete(bloodPressureLogs)
        .where(and(eq(bloodPressureLogs.userId, userId), eq(bloodPressureLogs.id, id)))
        .returning({ id: bloodPressureLogs.id });
        
      return !!row;
    } catch (error) {
      console.error("Error in PressureRepository.delete:", error);
      throw error;
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await db.delete(bloodPressureLogs).where(eq(bloodPressureLogs.userId, userId));
    } catch (error) {
      console.error("Error in PressureRepository.deleteByUserId:", error);
      throw error;
    }
  }

  async bulkCreate(userId: string, records: any[]): Promise<void> {
    if (records.length === 0) return;
    try {
      const payload = records.map(data => ({
        userId,
        measuredAt: new Date(data.measuredAt),
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse ?? null,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      }));
      await db.insert(bloodPressureLogs).values(payload);
    } catch (error) {
      console.error("Error in PressureRepository.bulkCreate:", error);
      throw error;
    }
  }
}
