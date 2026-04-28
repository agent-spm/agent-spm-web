export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-8">
        {/* Search bar skeleton */}
        <div className="h-14 w-full rounded-xl bg-surface-200 dark:bg-surface-800" />

        {/* Filters skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-lg bg-surface-200 dark:bg-surface-800"
            />
          ))}
        </div>

        {/* Results grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-950"
            >
              <div className="space-y-3">
                <div className="h-5 w-3/4 rounded bg-surface-200 dark:bg-surface-800" />
                <div className="h-4 w-full rounded bg-surface-200 dark:bg-surface-800" />
                <div className="h-4 w-2/3 rounded bg-surface-200 dark:bg-surface-800" />
              </div>
              <div className="mt-4 flex gap-4">
                <div className="h-3 w-16 rounded bg-surface-200 dark:bg-surface-800" />
                <div className="h-3 w-16 rounded bg-surface-200 dark:bg-surface-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
