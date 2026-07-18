import { Panel, Skeleton } from "@/components/ui";

export default function TrendsLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:gap-8 p-4 md:p-8 w-full animate-pulse">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-56" />
        </div>
        {/* Filters buttons bar */}
        <div className="grid grid-cols-6 border border-[rgb(var(--border))]/50 rounded-md overflow-hidden bg-[rgb(var(--panel))] w-72 shrink-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 border-r border-[rgb(var(--border))]/50 last:border-r-0 flex items-center justify-center">
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </header>

      {/* What's Changed Banner */}
      <Panel variant="compact" elevation={1} className="h-14 flex items-center gap-8 bg-[rgb(var(--panel-soft))]">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </Panel>

      {/* Weight Journey */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-32 border-b border-[rgb(var(--border))] pb-2" />
        <Panel elevation={1} className="h-[360px] flex flex-col justify-end">
          <Skeleton className="h-[280px] w-full" />
        </Panel>
      </section>

      {/* Body Composition */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-40 border-b border-[rgb(var(--border))] pb-2" />
        <div className="grid md:grid-cols-2 gap-6 h-[300px]">
          <Panel variant="compact" elevation={1} className="flex flex-col h-[300px] justify-between">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-[200px] w-full flex-1" />
          </Panel>
          <Panel variant="compact" elevation={1} className="flex flex-col h-[300px] justify-between">
            <Skeleton className="h-4 w-12 mb-4" />
            <Skeleton className="h-[200px] w-full flex-1" />
          </Panel>
        </div>
      </section>

      {/* Cardiovascular */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-44 border-b border-[rgb(var(--border))] pb-2" />
        <Panel elevation={1} className="h-[320px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          <Skeleton className="h-[220px] w-full flex-1" />
        </Panel>
      </section>

      {/* Metabolic */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-36 border-b border-[rgb(var(--border))] pb-2" />
        <Panel elevation={1} className="h-[300px] flex flex-col justify-between">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-[200px] w-full flex-1" />
        </Panel>
      </section>
    </div>
  );
}
