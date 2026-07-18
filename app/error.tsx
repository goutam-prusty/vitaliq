"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route crash captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--bg))] p-6 text-center text-[rgb(var(--text))]">
      <div className="max-w-md w-full p-6 border border-[rgb(var(--border))] bg-[rgb(var(--panel))] rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-[rgb(var(--danger))] animate-pulse">Something went wrong</h2>
        <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
          An error occurred while loading this page. Please try again or return to the landing page.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/landing" className="w-full sm:w-auto">
            <button className="px-4 py-2 border border-[rgb(var(--border))] hover:bg-[rgb(var(--panel-soft))] text-sm font-semibold rounded-md transition-colors cursor-pointer w-full focus-ring">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
