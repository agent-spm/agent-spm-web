export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-surface-200 dark:bg-surface-800" />
                <div className="h-8 w-16 rounded bg-surface-200 dark:bg-surface-800" />
              </div>
              <div className="h-10 w-10 rounded-lg bg-surface-200 dark:bg-surface-800" />
            </div>
            <div className="mt-4 h-4 w-20 rounded bg-surface-200 dark:bg-surface-800" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
        <div className="mb-4 h-5 w-32 rounded bg-surface-200 dark:bg-surface-800" />
        <div className="h-64 w-full rounded-lg bg-surface-200 dark:bg-surface-800" />
      </div>
    </div>
  );
}
