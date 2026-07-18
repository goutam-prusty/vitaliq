import { Panel, Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:gap-8 p-4 md:p-8 w-full animate-pulse">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </header>

      {/* Health Insights */}
      <div className="grid gap-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Panel key={i} variant="compact" elevation={1} className="h-28 flex flex-col justify-between">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-2.5 w-1/3 mt-2" />
            </Panel>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Panel key={i} elevation={1} className="h-36 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-8 w-24 mt-2" />
            <div className="flex items-end justify-between mt-4">
              <div className="grid gap-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Panel>
        ))}
      </div>

      {/* Chart & Targets */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Panel elevation={1} className="h-[320px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <Skeleton className="h-[240px] w-full" />
        </Panel>

        <Panel elevation={1} className="h-[320px] flex flex-col">
          <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3 mb-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between border-b border-[rgb(var(--border))] pb-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-12" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Activity Logs */}
      <Panel elevation={1}>
        <div className="border-b border-[rgb(var(--border))] pb-3 mb-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-[rgb(var(--border))]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="flex justify-between items-center py-3" key={i}>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
