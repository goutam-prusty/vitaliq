"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global crash captured:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900 p-6 text-center font-sans">
        <div className="max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">A critical error occurred</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The application crashed during initial load. Please check your connection or try again.
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 px-4 py-2 bg-[rgb(20,111,101)] hover:opacity-90 text-white text-sm font-semibold rounded-md transition-opacity cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
