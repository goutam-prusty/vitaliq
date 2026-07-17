import { auth } from "@clerk/nextjs/server";
import { HealthDomain } from "@/core/domains/HealthDomain";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { metrics, type MetricKey } from "@/lib/metrics";
import { rangeStart } from "@/lib/dates";
import { summarizeMetric, MetricSummary, extractTimeSeries } from "@/core/analytics/engine";
import { generateInsights } from "@/core/analytics/insights";
import { movingAverage } from "@/core/analytics/statistics";
import type { HealthRecord } from "@/lib/types";
import { TrendsWorkbench } from "@/components/features/trends-workbench";
import { subDays } from "date-fns";

interface PageProps {
  searchParams: Promise<{
    metric?: string;
    range?: string;
    ma?: string;
    goal?: string;
    compare?: string;
  }>;
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <p className="text-[rgb(var(--danger))]">Unauthorized access. Please log in.</p>
      </div>
    );
  }

  // Await searchParams Promise
  const params = await searchParams;
  const metricKey = (params.metric as MetricKey) || "weightKg";
  const range = params.range || "90D";
  const showMovingAverage = params.ma === "true";
  const showGoal = params.goal !== "false"; // Defaults to true
  const isComparing = params.compare === "true" && range !== "All";

  // Validate the metric key, fallback if invalid
  const metric = metrics.find((m) => m.key === metricKey) || metrics[0];

  const healthDomain = new HealthDomain();
  const profileDomain = new ProfileDomain();
  const settings = await profileDomain.getSettings(userId);

  // 1. Calculate Date boundaries for current and comparative periods
  const refDate = new Date();
  const currentTo = refDate;
  const currentFrom = rangeStart(range) || subDays(refDate, 90);

  let queryFrom = currentFrom;
  let previousFrom: Date | undefined;
  let previousTo: Date | undefined;

  if (isComparing) {
    const diffMs = currentTo.getTime() - currentFrom.getTime();
    previousFrom = new Date(currentFrom.getTime() - diffMs);
    previousTo = currentFrom;
    queryFrom = previousFrom; // Expand query window to cover both periods
  }

  const queryFromStr = queryFrom.toISOString();

  // 2. Load historical logs via domain selection orchestrator
  const records = await healthDomain.getMetricRecords(userId, metric.kind, queryFromStr);

  // 3. Extract time-series arrays for both periods
  const currentSeries = extractTimeSeries(records, metric.key, currentFrom, currentTo);
  const previousSeries = isComparing && previousFrom && previousTo
    ? extractTimeSeries(records, metric.key, previousFrom, previousTo)
    : [];

  // Calculate summaries
  const currentValues = currentSeries.map((p) => p.value).filter((v): v is number => v !== undefined);
  const currentMAs = movingAverage(currentValues, 7);

  const summary = summarizeMetric(records, metric.key, currentFrom, currentTo);
  
  let prevSummary: MetricSummary | undefined;
  if (isComparing && previousFrom && previousTo) {
    prevSummary = summarizeMetric(records, metric.key, previousFrom, previousTo);
  }

  // 4. Format Recharts chart dataset
  let chartData: any[] = [];
  if (isComparing) {
    const maxLen = Math.max(currentSeries.length, previousSeries.length);
    for (let i = 0; i < maxLen; i++) {
      chartData.push({
        index: i + 1,
        currentValue: currentSeries[i]?.value,
        previousValue: previousSeries[i]?.value,
      });
    }
  } else {
    chartData = currentSeries.map((p, index) => ({
      date: p.date,
      currentValue: p.value,
      movingAverage: currentMAs[index],
    }));
  }

  // 5. Generate active metric observations insights
  const rawInsights = generateInsights(records, settings, {}, refDate);
  const activeInsights = rawInsights.filter((insight) => 
    insight.supportingMetrics.includes(metric.key)
  );

  return (
    <TrendsWorkbench
      initialMetricKey={metric.key}
      initialRange={range}
      showMovingAverage={showMovingAverage}
      showGoal={showGoal}
      isComparing={isComparing}
      chartData={chartData}
      records={records}
      summary={summary}
      prevSummary={prevSummary}
      insights={activeInsights}
      settings={settings}
    />
  );
}
