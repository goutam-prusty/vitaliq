"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App shell route crash captured:", error);
  }, [error]);

  return (
    <div className="mx-auto grid max-w-lg gap-5 p-4 md:p-8 text-center justify-items-center mt-12">
      <div className="p-6 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-bold text-[rgb(var(--danger))]">Failed to load view</h2>
        <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
          Vitaliq was unable to load health records or process analytics for this screen. This may be due to temporary network database issues.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()}>
            Retry View
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="px-4 py-2 border border-[rgb(var(--border))] hover:bg-[rgb(var(--panel-soft))] text-sm font-semibold rounded-md transition-colors cursor-pointer w-full focus-ring">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
