export interface QueryFilters {
  userId: string;
  from?: string; // ISO date/time string
  to?: string;   // ISO date/time string
  limit?: number;
  cursor?: string; // Timestamp cursor for pagination
  search?: string; // Search query on notes text
}

export interface BaseRepository<T, CreateInput, UpdateInput> {
  findById(userId: string, id: string): Promise<T | null>;
  findMany(filters: QueryFilters): Promise<T[]>;
  create(userId: string, data: CreateInput): Promise<T>;
  update(userId: string, id: string, data: UpdateInput): Promise<T>;
  delete(userId: string, id: string): Promise<boolean>;
}
