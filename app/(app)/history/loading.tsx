import { Panel, Skeleton } from "@/components/ui";

export default function HistoryLoading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 p-4 md:p-8 animate-pulse">
      {/* Header */}
      <header>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-1.5 h-8 w-32" />
      </header>

      {/* Main layout matches history page 2-column grid container */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left column - filters & search & list */}
        <div className="grid gap-4 content-start">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category tabs */}
            <div className="flex gap-1.5 p-1 bg-[rgb(var(--border))]/30 rounded-lg w-fit">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-md" />
              ))}
            </div>
            {/* Search Input */}
            <Skeleton className="h-9 w-full sm:w-60 rounded-lg" />
          </div>

          {/* List panel */}
          <Panel elevation={1} className="divide-y divide-[rgb(var(--border))]/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="grid gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-3 w-5/6 max-w-lg" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* Right column - sidebar placeholder */}
        <div className="hidden lg:block">
          <Panel variant="compact" elevation={1} className="h-48 flex flex-col justify-between">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <Skeleton className="h-8 w-full mt-4" />
          </Panel>
        </div>
      </div>
    </div>
  );
}
