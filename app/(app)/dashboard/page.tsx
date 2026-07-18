import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, PlusCircle, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { displayGlucose, displayWeight } from "@/lib/units";
import { HealthDomain } from "@/core/domains/HealthDomain";
import { ProfileDomain } from "@/core/domains/ProfileDomain";
import { Button, Panel, SecondaryButton } from "@/components/ui";
import { MiniChart } from "@/components/mini-chart";
import { Sparkline } from "@/components/features/sparkline";
import { summarizeAllMetrics, computeGoalProgress, extractTimeSeries } from "@/core/analytics/engine";
import { generateInsights, prioritizeInsights, HealthInsight } from "@/core/analytics/insights";
import type { BodyRecord, GlucoseRecord, PressureRecord, HealthRecord } from "@/lib/types";

export default async function OverviewPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <Page>
        <p className="text-[rgb(var(--danger))]">Unauthorized access. Please log in.</p>
      </Page>
    );
  }

  const healthDomain = new HealthDomain();
  const profileDomain = new ProfileDomain();

  // Evaluate analytics over the last 90 days to keep query payloads optimized
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const fromStr = ninetyDaysAgo.toISOString();

  // Load snapshot configurations, settings, and historical logs in parallel
  const [snapshot, settings, historicalLogs, weightRecords] = await Promise.all([
    healthDomain.getDashboardSnapshot(userId),
    profileDomain.getSettings(userId),
    healthDomain.getRecordsByDate(userId, fromStr),
    healthDomain.getRecentWeightRecords(userId, 30),
  ]);

  const { latestBody, latestPressure, latestGlucose, recentActivity } = snapshot;

  // Run pure analytics engine operations
  const summaries = summarizeAllMetrics(historicalLogs.all);
  const rawInsights = generateInsights(historicalLogs.all, settings, {}, new Date());
  const insights = prioritizeInsights(rawInsights).slice(0, 3);
  const goalProgress = computeGoalProgress(historicalLogs.all, settings);

  // Extract sparkline points (past 90 days values)
  const weightPoints = extractTimeSeries(historicalLogs.all, "weightKg").map(p => p.value);
  const systolicPoints = extractTimeSeries(historicalLogs.all, "systolic").map(p => p.value);
  const glucosePoints = extractTimeSeries(historicalLogs.all, "glucoseMgDl").map(p => p.value);

  // Calculate greeting matching user settings timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: settings.timezone || "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Page>
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--muted))]" suppressHydrationWarning>
            {settings.name ? `${greeting}, ${settings.name}` : greeting}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Overview</h1>
        </div>
        <Link href="/log">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Log reading
          </Button>
        </Link>
      </header>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-[rgb(var(--muted))] uppercase tracking-wider">Health Insights</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Weight" 
          value={displayWeight(latestBody?.weightKg, settings)} 
          sub={stamp(latestBody?.timestamp)} 
          sparklineData={weightPoints}
          trend={summaries.weightKg?.trend}
          avgValue={summaries.weightKg?.mean ? `Avg: ${displayWeight(summaries.weightKg.mean, settings)}` : undefined}
        />
        <MetricCard 
          title="Blood Pressure" 
          value={latestPressure ? `${latestPressure.systolic}/${latestPressure.diastolic}` : "—"} 
          sub={latestPressure ? `${latestPressure.category} · ${stamp(latestPressure.timestamp)}` : "No reading"} 
          sparklineData={systolicPoints}
          trend={summaries.systolic?.trend}
          avgValue={summaries.systolic?.mean ? `Avg: ${summaries.systolic.mean.toFixed(0)} mmHg` : undefined}
        />
        <MetricCard 
          title="Glucose" 
          value={displayGlucose(latestGlucose?.glucoseMgDl, settings)} 
          sub={latestGlucose ? `${latestGlucose.category} · ${stamp(latestGlucose.timestamp)}` : "No reading"} 
          sparklineData={glucosePoints}
          trend={summaries.glucoseMgDl?.trend}
          avgValue={summaries.glucoseMgDl?.mean ? `Avg: ${displayGlucose(summaries.glucoseMgDl.mean, settings)}` : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        {/* Trend Graph */}
        <Panel elevation={1}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-base">Recent trend</h2>
            <Link className="text-xs font-semibold text-[rgb(var(--accent))] hover:underline flex items-center gap-1" href="/trends">
              Explore <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <MiniChart records={weightRecords as unknown as HealthRecord[]} settings={settings} />
        </Panel>

        {/* Goal Targets */}
        <Panel elevation={1}>
          <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
            <Target className="h-4 w-4 text-[rgb(var(--accent))]" />
            <h2 className="font-semibold tracking-tight text-base">Targets</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {settings.targetWeightKg ? (
              <div className="flex justify-between border-b border-[rgb(var(--border))] pb-2">
                <span className="text-[rgb(var(--muted))] text-xs font-semibold uppercase tracking-wider">Target weight</span>
                <span className="num font-medium">{displayWeight(settings.targetWeightKg, settings)}</span>
              </div>
            ) : null}
            {goalProgress ? (
              <>
                <div className="flex justify-between border-b border-[rgb(var(--border))] pb-2">
                  <span className="text-[rgb(var(--muted))] text-xs font-semibold uppercase tracking-wider">Remaining</span>
                  <span className="num font-medium">
                    {displayWeight(Math.abs(goalProgress.remainingWeight), settings)}
                  </span>
                </div>
                {goalProgress.percentComplete !== undefined && (
                  <div className="grid gap-1.5 border-b border-[rgb(var(--border))] pb-2">
                    <div className="flex justify-between">
                      <span className="text-[rgb(var(--muted))] text-xs font-semibold uppercase tracking-wider">Goal progress</span>
                      <span className="font-semibold text-xs">
                        {goalProgress.percentComplete < 0 ? "0" : goalProgress.percentComplete.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-[rgb(var(--border))] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[rgb(var(--accent))] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(0, Math.min(100, goalProgress.percentComplete))}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : null}
            {settings.targetBodyFatPercent ? (
              <div className="flex justify-between border-b border-[rgb(var(--border))] pb-2">
                <span className="text-[rgb(var(--muted))] text-xs font-semibold uppercase tracking-wider">Target body fat</span>
                <span className="num font-medium">{settings.targetBodyFatPercent.toFixed(1)}%</span>
              </div>
            ) : null}
            {!settings.targetWeightKg && !settings.targetBodyFatPercent ? (
              <Link href="/settings">
                <SecondaryButton className="w-full mt-2">Set a target</SecondaryButton>
              </Link>
            ) : null}
          </div>
        </Panel>
      </div>

      {/* Activity Logs */}
      <Panel elevation={1}>
        <h2 className="font-semibold tracking-tight text-base border-b border-[rgb(var(--border))] pb-3">Recent activity</h2>
        <div className="divide-y divide-[rgb(var(--border))]">
          {recentActivity.length === 0 ? (
            <div className="py-6 text-center text-sm text-[rgb(var(--muted))]">No recent activity logs.</div>
          ) : (
            recentActivity.map((record) => (
              <div className="flex items-center justify-between py-3 text-sm" key={record.id}>
                <span className="font-medium text-[rgb(var(--text))]">{label(record)}</span>
                <span className="text-xs text-[rgb(var(--muted))]" suppressHydrationWarning>
                  {stamp(record.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid max-w-7xl gap-6 lg:gap-8 p-4 md:p-8 w-full">{children}</div>;
}

interface MetricCardProps {
  title: string;
  value: string;
  sub: string;
  sparklineData: number[];
  trend?: "up" | "down" | "flat";
  avgValue?: string;
}

function MetricCard({ title, value, sub, sparklineData, trend, avgValue }: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-[rgb(var(--danger))]" : trend === "down" ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))]";

  return (
    <Panel className="flex flex-col justify-between" elevation={1}>
      <div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">{title}</div>
          {trend && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend}
            </span>
          )}
        </div>
        <div className="num mt-2 text-3xl font-semibold leading-none tracking-tight">{value}</div>
      </div>
      <div className="flex items-end justify-between mt-4">
        <div className="grid gap-0.5">
          <div className="text-xs text-[rgb(var(--muted))]" suppressHydrationWarning>{sub}</div>
          {avgValue && <div className="text-xs font-semibold text-[rgb(var(--muted))]">{avgValue}</div>}
        </div>
        <Sparkline data={sparklineData} color={trend === "down" ? "rgb(var(--accent))" : trend === "up" ? "rgb(var(--danger))" : undefined} />
      </div>
    </Panel>
  );
}

function InsightCard({ insight }: { insight: HealthInsight }) {
  const colors: Record<string, string> = {
    attention: "border-l-4 border-[rgb(var(--danger))] bg-[rgb(var(--danger))]/5",
    warning: "border-l-4 border-[rgb(var(--warn))] bg-[rgb(var(--warn))]/5",
    success: "border-l-4 border-[rgb(var(--ok))] bg-[rgb(var(--ok))]/5",
    info: "border-l-4 border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/5",
  };

  const titleColors: Record<string, string> = {
    attention: "text-[rgb(var(--danger))]",
    warning: "text-[rgb(var(--warn))]",
    success: "text-[rgb(var(--ok))]",
    info: "text-[rgb(var(--accent))]",
  };

  return (
    <Panel className={`flex flex-col gap-1 overflow-hidden shadow-xs hover:shadow-sm transition-shadow duration-200 ${colors[insight.severity] || ""}`} elevation={1} variant="compact">
      <h4 className={`font-semibold text-sm tracking-tight ${titleColors[insight.severity] || ""}`}>
        {insight.title}
      </h4>
      <p className="text-xs text-[rgb(var(--muted))] leading-relaxed flex-1">
        {insight.description}
      </p>
      {insight.evaluationPeriod && (
        <span className="text-[10px] uppercase font-bold tracking-wider text-[rgb(var(--muted))] mt-2 block">
          Period: {insight.evaluationPeriod}
        </span>
      )}
    </Panel>
  );
}

function stamp(timestamp?: string) {
  return timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : "No reading";
}

function label(record: BodyRecord | PressureRecord | GlucoseRecord) {
  if (record.kind === "body") return `Body composition · ${record.weightKg.toFixed(1)} kg`;
  if (record.kind === "pressure") return `Blood pressure · ${record.systolic}/${record.diastolic}`;
  return `Blood glucose · ${record.glucoseMgDl.toFixed(0)} mg/dL`;
}
