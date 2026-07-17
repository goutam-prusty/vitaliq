import { BaseRepository, QueryFilters } from "./BaseRepository";
import { GlucoseRecord } from "@/lib/types";
import { db } from "@/db/client";
import { bloodGlucoseLogs } from "@/db/schema";
import { eq, and, desc, gte, lte, ilike, lt } from "drizzle-orm";
import { makeTimestamp } from "@/lib/dates";

export type GlucoseRecordInput = {
  date: string;
  time: string;
  glucoseMgDl: number;
  notes?: string;
  source?: string;
};

export function mapGlucoseRowToDomain(row: any): GlucoseRecord {
  const dateObj = new Date(row.measuredAt);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "glucose",
    date: row.measuredDate,
    time: timeStr,
    timestamp: row.measuredAt.toISOString(),
    notes: row.notes ?? undefined,
    glucoseMgDl: row.glucoseMgDl,
    category: row.category,
  };
}

export class GlucoseRepository implements BaseRepository<GlucoseRecord, GlucoseRecordInput, Partial<GlucoseRecordInput>> {
  async findById(userId: string, id: string): Promise<GlucoseRecord | null> {
    try {
      const data = await db.select().from(bloodGlucoseLogs).where(
        and(eq(bloodGlucoseLogs.userId, userId), eq(bloodGlucoseLogs.id, id))
      ).limit(1);

      if (!data || data.length === 0) return null;
      return mapGlucoseRowToDomain(data[0]);
    } catch (error) {
      console.error("Error in GlucoseRepository.findById:", error);
      throw error;
    }
  }

  async findMany(filters: QueryFilters): Promise<GlucoseRecord[]> {
    try {
      const conditions = [eq(bloodGlucoseLogs.userId, filters.userId)];

      if (filters.from) conditions.push(gte(bloodGlucoseLogs.measuredAt, new Date(filters.from)));
      if (filters.to) conditions.push(lte(bloodGlucoseLogs.measuredAt, new Date(filters.to)));
      if (filters.search) conditions.push(ilike(bloodGlucoseLogs.notes, `%${filters.search}%`));
      if (filters.cursor) conditions.push(lt(bloodGlucoseLogs.measuredAt, new Date(filters.cursor)));

      const query = db.select().from(bloodGlucoseLogs)
        .where(and(...conditions))
        .orderBy(desc(bloodGlucoseLogs.measuredAt));

      if (filters.limit) {
        query.limit(filters.limit);
      }

      const data = await query;
      return data.map(mapGlucoseRowToDomain);
    } catch (error) {
      console.error("Error in GlucoseRepository.findMany:", error);
      throw error;
    }
  }

  async create(userId: string, data: GlucoseRecordInput): Promise<GlucoseRecord> {
    try {
      const measuredAt = new Date(makeTimestamp(data.date, data.time));
      
      const payload: any = {
        userId,
        measuredAt,
        glucoseMgDl: data.glucoseMgDl,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      };

      const [row] = await db.insert(bloodGlucoseLogs).values(payload).returning();
      return mapGlucoseRowToDomain(row);
    } catch (error) {
      console.error("Error in GlucoseRepository.create:", error);
      throw error;
    }
  }

  async update(userId: string, id: string, data: Partial<GlucoseRecordInput>): Promise<GlucoseRecord> {
    try {
      const updatePayload: Record<string, any> = {};

      if (data.date !== undefined || data.time !== undefined) {
        if (data.date === undefined || data.time === undefined) {
          throw new Error("Both date and time must be provided when updating the timestamp.");
        }
        updatePayload.measuredAt = new Date(makeTimestamp(data.date, data.time));
      }

      if (data.glucoseMgDl !== undefined) updatePayload.glucoseMgDl = data.glucoseMgDl;
      if (data.notes !== undefined) updatePayload.notes = data.notes;
      if (data.source !== undefined) updatePayload.source = data.source;

      updatePayload.updatedAt = new Date();

      const [row] = await db.update(bloodGlucoseLogs)
        .set(updatePayload)
        .where(and(eq(bloodGlucoseLogs.userId, userId), eq(bloodGlucoseLogs.id, id)))
        .returning();

      if (!row) throw new Error("Not found");

      return mapGlucoseRowToDomain(row);
    } catch (error) {
      console.error("Error in GlucoseRepository.update:", error);
      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    try {
      const [row] = await db.delete(bloodGlucoseLogs)
        .where(and(eq(bloodGlucoseLogs.userId, userId), eq(bloodGlucoseLogs.id, id)))
        .returning({ id: bloodGlucoseLogs.id });
        
      return !!row;
    } catch (error) {
      console.error("Error in GlucoseRepository.delete:", error);
      throw error;
    }
  }
}
