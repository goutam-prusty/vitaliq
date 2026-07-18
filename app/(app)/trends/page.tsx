import { auth } from "@clerk/nextjs/server";
import { HealthDomain } from "@/core/domains/HealthDomain";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { rangeStart } from "@/lib/dates";
import { subDays } from "date-fns";
import { TrendsDashboard } from "@/components/features/trends-dashboard";

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-8 text-[rgb(var(--danger))]">Unauthorized access. Please log in.</div>;
  }

  const params = await searchParams;
  const range = params.range || "90D";

  const healthDomain = new HealthDomain();
  const profileDomain = new ProfileDomain();

  const settings = await profileDomain.getSettings(userId);
  const refDate = new Date();
  const fromDate = rangeStart(range) || subDays(refDate, 90);
  const fromStr = fromDate.toISOString();

  // Fetch all records for the dashboard
  const records = await healthDomain.getRecordsByDate(userId, fromStr);

  return (
    <TrendsDashboard 
      records={records.all} 
      settings={settings}
      initialRange={range}
    />
  );
}
