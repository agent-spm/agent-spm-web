export default function PackageDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-surface-200 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-64 rounded-lg bg-surface-200 dark:bg-surface-800" />
          <div className="mt-3 h-5 w-96 rounded-lg bg-surface-200 dark:bg-surface-800" />
          <div className="mt-6 flex gap-6">
            <div className="h-4 w-32 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-24 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-40 rounded bg-surface-200 dark:bg-surface-800" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-5/6 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-4/6 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="mt-8 h-32 w-full rounded-xl bg-surface-200 dark:bg-surface-800" />
          </div>
          <div className="h-64 rounded-xl bg-surface-200 dark:bg-surface-800" />
        </div>
      </div>
    </div>
  );
}
