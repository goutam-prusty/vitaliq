import { BodyRepository, BodyRecordInput } from "@/core/repositories/BodyRepository";
import { PressureRepository, PressureRecordInput } from "@/core/repositories/PressureRepository";
import { GlucoseRepository, GlucoseRecordInput } from "@/core/repositories/GlucoseRepository";
import { HealthRecord, BodyRecord, PressureRecord, GlucoseRecord, LogKind } from "@/lib/types";

export interface SnapshotData {
  latestBody: BodyRecord | null;
  latestPressure: PressureRecord | null;
  latestGlucose: GlucoseRecord | null;
  recentActivity: HealthRecord[];
}

export interface TimelineFilters {
  limit?: number;
  cursor?: string; // Timestamp cursor (ISO format)
  kind?: LogKind | "all";
  search?: string;
}

export interface TimelineData {
  records: HealthRecord[];
  nextCursor?: string;
}

export class HealthDomain {
  private bodyRepo = new BodyRepository();
  private pressureRepo = new PressureRepository();
  private glucoseRepo = new GlucoseRepository();

  /**
   * Sorts records chronologically descending (newest first).
   */
  private sortRecords(records: HealthRecord[]): HealthRecord[] {
    return [...records].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return b.kind.localeCompare(a.kind);
    });
  }

  /**
   * Retrieves the most recent measurement from each record type in parallel.
   */
  async getLatestMeasurements(userId: string): Promise<{
    body: BodyRecord | null;
    pressure: PressureRecord | null;
    glucose: GlucoseRecord | null;
  }> {
    const [bodies, pressures, glucoses] = await Promise.all([
      this.bodyRepo.findMany({ userId, limit: 1 }),
      this.pressureRepo.findMany({ userId, limit: 1 }),
      this.glucoseRepo.findMany({ userId, limit: 1 }),
    ]);

    return {
      body: bodies[0] ?? null,
      pressure: pressures[0] ?? null,
      glucose: glucoses[0] ?? null,
    };
  }

  /**
   * Retrieves records grouped by category and chronologically sorted.
   */
  async getRecordsByDate(
    userId: string,
    from?: string,
    to?: string
  ): Promise<{
    body: BodyRecord[];
    pressure: PressureRecord[];
    glucose: GlucoseRecord[];
    all: HealthRecord[];
  }> {
    const [body, pressure, glucose] = await Promise.all([
      this.bodyRepo.findMany({ userId, from, to }),
      this.pressureRepo.findMany({ userId, from, to }),
      this.glucoseRepo.findMany({ userId, from, to }),
    ]);

    const all = this.sortRecords([...body, ...pressure, ...glucose]);

    return { body, pressure, glucose, all };
  }

  /**
   * Creates a consolidated dashboard view containing the latest measurements card values
   * and the most recent 8 records logged across all categories.
   */
  async getDashboardSnapshot(userId: string): Promise<SnapshotData> {
    const [latest, recent] = await Promise.all([
      this.getLatestMeasurements(userId),
      this.getTimeline(userId, { limit: 8 }),
    ]);

    return {
      latestBody: latest.body,
      latestPressure: latest.pressure,
      latestGlucose: latest.glucose,
      recentActivity: recent.records,
    };
  }

  /**
   * Retrieves a paginated unified feed of all records sorted chronologically.
   * Feeds are fetched from sources matching the filters in parallel, merged, sorted, and paginated.
   */
  async getTimeline(userId: string, filters: TimelineFilters): Promise<TimelineData> {
    const limit = filters.limit ?? 20;
    const kind = filters.kind ?? "all";
    const search = filters.search;

    let body: BodyRecord[] = [];
    let pressure: PressureRecord[] = [];
    let glucose: GlucoseRecord[] = [];

    const fetchPromises: Promise<any>[] = [];

    if (kind === "all" || kind === "body") {
      fetchPromises.push(
        this.bodyRepo.findMany({ userId, limit, cursor: filters.cursor, search }).then((res) => {
          body = res;
        })
      );
    }
    if (kind === "all" || kind === "pressure") {
      fetchPromises.push(
        this.pressureRepo.findMany({ userId, limit, cursor: filters.cursor, search }).then((res) => {
          pressure = res;
        })
      );
    }
    if (kind === "all" || kind === "glucose") {
      fetchPromises.push(
        this.glucoseRepo.findMany({ userId, limit, cursor: filters.cursor, search }).then((res) => {
          glucose = res;
        })
      );
    }

    await Promise.all(fetchPromises);

    const merged = this.sortRecords([...body, ...pressure, ...glucose]);
    const sliced = merged.slice(0, limit);
    
    const nextCursor = sliced.length > 0 && merged.length > limit
      ? sliced[sliced.length - 1].timestamp
      : undefined;

    return {
      records: sliced,
      nextCursor,
    };
  }

  /**
   * Unified CRUD operation: Creates a new health record of a specific kind.
   */
  async createRecord(userId: string, kind: LogKind, data: any): Promise<HealthRecord> {
    switch (kind) {
      case "body":
        return await this.bodyRepo.create(userId, data as BodyRecordInput);
      case "pressure":
        return await this.pressureRepo.create(userId, data as PressureRecordInput);
      case "glucose":
        return await this.glucoseRepo.create(userId, data as GlucoseRecordInput);
      default:
        throw new Error(`Unsupported record kind: ${kind}`);
    }
  }

  /**
   * Unified CRUD operation: Updates an existing health record of a specific kind.
   */
  async updateRecord(userId: string, kind: LogKind, id: string, data: any): Promise<HealthRecord> {
    switch (kind) {
      case "body":
        return await this.bodyRepo.update(userId, id, data as Partial<BodyRecordInput>);
      case "pressure":
        return await this.pressureRepo.update(userId, id, data as Partial<PressureRecordInput>);
      case "glucose":
        return await this.glucoseRepo.update(userId, id, data as Partial<GlucoseRecordInput>);
      default:
        throw new Error(`Unsupported record kind: ${kind}`);
    }
  }

  /**
   * Unified CRUD operation: Deletes an existing health record of a specific kind.
   */
  async deleteRecord(userId: string, kind: LogKind, id: string): Promise<boolean> {
    switch (kind) {
      case "body":
        return await this.bodyRepo.delete(userId, id);
      case "pressure":
        return await this.pressureRepo.delete(userId, id);
      case "glucose":
        return await this.glucoseRepo.delete(userId, id);
      default:
        throw new Error(`Unsupported record kind: ${kind}`);
    }
  }

  /**
   * Retrieves recent body records containing weight information.
   */
  async getRecentWeightRecords(userId: string, limit = 30): Promise<BodyRecord[]> {
    return await this.bodyRepo.findMany({ userId, limit });
  }

  /**
   * Retrieves historical logs for specific indicator categories (body, pressure, glucose) over a timeline.
   */
  async getMetricRecords(userId: string, kind: LogKind, from?: string): Promise<HealthRecord[]> {
    switch (kind) {
      case "body":
        return (await this.bodyRepo.findMany({ userId, from })) as unknown as HealthRecord[];
      case "pressure":
        return (await this.pressureRepo.findMany({ userId, from })) as unknown as HealthRecord[];
      case "glucose":
        return (await this.glucoseRepo.findMany({ userId, from })) as unknown as HealthRecord[];
      default:
        throw new Error(`Unsupported health log category: ${kind}`);
    }
  }
}
