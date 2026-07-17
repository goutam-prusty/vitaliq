import { BaseRepository, QueryFilters } from "./BaseRepository";
import { GlucoseRecord } from "@/lib/types";
import { getSupabaseServer } from "@/lib/database/client";
import { makeTimestamp } from "@/lib/dates";

export interface GlucoseDBRow {
  id: string;
  user_id: string;
  measured_at: string;
  measured_date: string;
  glucose_mg_dl: number;
  category: string;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export type GlucoseRecordInput = {
  date: string;
  time: string;
  glucoseMgDl: number;
  notes?: string;
  source?: string;
};

export function mapGlucoseRowToDomain(row: GlucoseDBRow): GlucoseRecord {
  const dateObj = new Date(row.measured_at);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "glucose",
    date: row.measured_date,
    time: timeStr,
    timestamp: row.measured_at,
    notes: row.notes ?? undefined,
    glucoseMgDl: row.glucose_mg_dl,
    category: row.category,
  };
}

export class GlucoseRepository implements BaseRepository<GlucoseRecord, GlucoseRecordInput, Partial<GlucoseRecordInput>> {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findById(userId: string, id: string): Promise<GlucoseRecord | null> {
    const { data, error } = await this.getSupabase()
      .from("blood_glucose_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error in GlucoseRepository.findById:", error);
      throw error;
    }
    return data ? mapGlucoseRowToDomain(data) : null;
  }

  async findMany(filters: QueryFilters): Promise<GlucoseRecord[]> {
    let query = this.getSupabase()
      .from("blood_glucose_logs")
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
      console.error("Error in GlucoseRepository.findMany:", error);
      throw error;
    }

    return (data as GlucoseDBRow[]).map(mapGlucoseRowToDomain);
  }

  async create(userId: string, data: GlucoseRecordInput): Promise<GlucoseRecord> {
    const measuredAt = makeTimestamp(data.date, data.time);
    
    const { data: row, error } = await this.getSupabase()
      .from("blood_glucose_logs")
      .insert({
        user_id: userId,
        measured_at: measuredAt,
        glucose_mg_dl: data.glucoseMgDl,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      })
      .select()
      .single();

    if (error) {
      console.error("Error in GlucoseRepository.create:", error);
      throw error;
    }

    return mapGlucoseRowToDomain(row);
  }

  async update(userId: string, id: string, data: Partial<GlucoseRecordInput>): Promise<GlucoseRecord> {
    const updatePayload: Record<string, any> = {};

    if (data.date !== undefined || data.time !== undefined) {
      if (data.date === undefined || data.time === undefined) {
        throw new Error("Both date and time must be provided when updating the timestamp.");
      }
      updatePayload.measured_at = makeTimestamp(data.date, data.time);
    }

    if (data.glucoseMgDl !== undefined) updatePayload.glucose_mg_dl = data.glucoseMgDl;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.source !== undefined) updatePayload.source = data.source;

    updatePayload.updated_at = new Date().toISOString();

    const { data: row, error } = await this.getSupabase()
      .from("blood_glucose_logs")
      .update(updatePayload)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error in GlucoseRepository.update:", error);
      throw error;
    }

    return mapGlucoseRowToDomain(row);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.getSupabase()
      .from("blood_glucose_logs")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) {
      console.error("Error in GlucoseRepository.delete:", error);
      throw error;
    }
    return true;
  }
}
