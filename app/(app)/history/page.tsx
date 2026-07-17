import { auth } from "@clerk/nextjs/server";
import { HealthDomain } from "@/core/domains/HealthDomain";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { TimelineList } from "@/components/features/timeline-list";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <p className="text-[rgb(var(--danger))]">Unauthorized access. Please log in.</p>
      </div>
    );
  }

  // 1. Parallel data loading on the server
  const healthDomain = new HealthDomain();
  const profileDomain = new ProfileDomain();

  const [timelineResult, settings] = await Promise.all([
    healthDomain.getTimeline(userId, { limit: 20 }),
    profileDomain.getSettings(userId),
  ]);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 p-4 md:p-8">
      <header>
        <p className="text-sm text-[rgb(var(--muted))]">Timeline of logs and measurements</p>
        <h1 className="mt-1 text-2xl font-semibold">History</h1>
      </header>

      <TimelineList 
        initialRecords={timelineResult.records} 
        initialCursor={timelineResult.nextCursor}
        settings={settings}
      />
    </div>
  );
}
