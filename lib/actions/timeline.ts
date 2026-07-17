"use server";

import { auth } from "@clerk/nextjs/server";
import { HealthDomain, TimelineData } from "@/core/domains/HealthDomain";
import { LogKind } from "@/lib/types";

const healthDomain = new HealthDomain();

/**
 * Server Action to load paginated pages of timeline records with filters and search queries.
 */
export async function fetchTimelineAction(filters: {
  limit?: number;
  cursor?: string;
  kind?: LogKind | "all";
  search?: string;
}): Promise<TimelineData> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await healthDomain.getTimeline(userId, filters);
}
