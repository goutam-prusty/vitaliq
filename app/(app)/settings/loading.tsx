import { Panel, Skeleton } from "@/components/ui";

export default function SettingsLoading() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 p-4 md:p-8 animate-pulse">
      {/* Header */}
      <header>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-1.5 h-8 w-32" />
      </header>

      {/* Main SettingsForm skeleton */}
      <Panel className="grid gap-6 p-5 md:grid-cols-2">
        {/* Profile section */}
        <div className="grid content-start gap-4">
          <Skeleton className="h-6 w-24 border-b border-[rgb(var(--border))]/50 pb-1" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Goals section */}
        <div className="grid content-start gap-4">
          <Skeleton className="h-6 w-20 border-b border-[rgb(var(--border))]/50 pb-1" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Preferences section */}
        <div className="grid content-start gap-4 md:col-span-2 mt-2">
          <Skeleton className="h-6 w-48 border-b border-[rgb(var(--border))]/50 pb-1" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            {[1, 2].map((i) => (
              <div key={i} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-4">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Bottom info panel */}
      <Panel className="p-5">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </Panel>
    </div>
  );
}
