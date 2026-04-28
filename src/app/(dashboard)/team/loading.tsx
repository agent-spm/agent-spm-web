export default function TeamLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Team header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded bg-surface-200 dark:bg-surface-800" />
          <div className="h-4 w-56 rounded bg-surface-200 dark:bg-surface-800" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-surface-200 dark:bg-surface-800" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950">
        {/* Table header */}
        <div className="flex gap-4 border-b border-surface-200 bg-surface-50 px-6 py-3 dark:border-surface-800 dark:bg-surface-900">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-20 rounded bg-surface-200 dark:bg-surface-800"
            />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-surface-200 px-6 py-4 last:border-0 dark:border-surface-800"
          >
            <div className="h-9 w-9 rounded-full bg-surface-200 dark:bg-surface-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded bg-surface-200 dark:bg-surface-800" />
              <div className="h-3 w-48 rounded bg-surface-200 dark:bg-surface-800" />
            </div>
            <div className="h-6 w-16 rounded-full bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-20 rounded bg-surface-200 dark:bg-surface-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
