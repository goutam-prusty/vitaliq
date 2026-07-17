import { BaseRepository, QueryFilters } from "./BaseRepository";
import { PressureRecord } from "@/lib/types";
import { getSupabaseServer } from "@/lib/database/client";
import { makeTimestamp } from "@/lib/dates";

export interface PressureDBRow {
  id: string;
  user_id: string;
  measured_at: string;
  measured_date: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  category: string;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export type PressureRecordInput = {
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  source?: string;
};

export function mapPressureRowToDomain(row: PressureDBRow): PressureRecord {
  const dateObj = new Date(row.measured_at);
  const timeStr = dateObj.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  return {
    id: row.id,
    kind: "pressure",
    date: row.measured_date,
    time: timeStr,
    timestamp: row.measured_at,
    notes: row.notes ?? undefined,
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse ?? undefined,
    category: row.category,
  };
}

export class PressureRepository implements BaseRepository<PressureRecord, PressureRecordInput, Partial<PressureRecordInput>> {
  private getSupabase() {
    return getSupabaseServer();
  }

  async findById(userId: string, id: string): Promise<PressureRecord | null> {
    const { data, error } = await this.getSupabase()
      .from("blood_pressure_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error in PressureRepository.findById:", error);
      throw error;
    }
    return data ? mapPressureRowToDomain(data) : null;
  }

  async findMany(filters: QueryFilters): Promise<PressureRecord[]> {
    let query = this.getSupabase()
      .from("blood_pressure_logs")
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
      console.error("Error in PressureRepository.findMany:", error);
      throw error;
    }

    return (data as PressureDBRow[]).map(mapPressureRowToDomain);
  }

  async create(userId: string, data: PressureRecordInput): Promise<PressureRecord> {
    const measuredAt = makeTimestamp(data.date, data.time);
    
    const { data: row, error } = await this.getSupabase()
      .from("blood_pressure_logs")
      .insert({
        user_id: userId,
        measured_at: measuredAt,
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse ?? null,
        notes: data.notes ?? null,
        source: data.source ?? "manual",
      })
      .select()
      .single();

    if (error) {
      console.error("Error in PressureRepository.create:", error);
      throw error;
    }

    return mapPressureRowToDomain(row);
  }

  async update(userId: string, id: string, data: Partial<PressureRecordInput>): Promise<PressureRecord> {
    const updatePayload: Record<string, any> = {};

    if (data.date !== undefined || data.time !== undefined) {
      if (data.date === undefined || data.time === undefined) {
        throw new Error("Both date and time must be provided when updating the timestamp.");
      }
      updatePayload.measured_at = makeTimestamp(data.date, data.time);
    }

    if (data.systolic !== undefined) updatePayload.systolic = data.systolic;
    if (data.diastolic !== undefined) updatePayload.diastolic = data.diastolic;
    if (data.pulse !== undefined) updatePayload.pulse = data.pulse;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.source !== undefined) updatePayload.source = data.source;

    updatePayload.updated_at = new Date().toISOString();

    const { data: row, error } = await this.getSupabase()
      .from("blood_pressure_logs")
      .update(updatePayload)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error in PressureRepository.update:", error);
      throw error;
    }

    return mapPressureRowToDomain(row);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const { error } = await this.getSupabase()
      .from("blood_pressure_logs")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) {
      console.error("Error in PressureRepository.delete:", error);
      throw error;
    }
    return true;
  }
}
