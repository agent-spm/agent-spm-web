"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SPM Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-brand-black dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-brand-black/60 dark:text-white/60">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="mt-1 block font-mono text-xs text-brand-black/40 dark:text-white/40">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-blue/90 active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
