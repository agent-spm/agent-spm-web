export default function BillingLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Billing header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded bg-surface-200 dark:bg-surface-800" />
        <div className="h-4 w-72 rounded bg-surface-200 dark:bg-surface-800" />
      </div>

      {/* Plan card skeleton */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-5 w-32 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-8 w-24 rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-4 w-48 rounded bg-surface-200 dark:bg-surface-800" />
          </div>
          <div className="h-10 w-28 rounded-lg bg-surface-200 dark:bg-surface-800" />
        </div>
      </div>

      {/* Usage bar skeleton */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
        <div className="h-4 w-24 rounded bg-surface-200 dark:bg-surface-800" />
        <div className="mt-4 h-3 w-full rounded-full bg-surface-200 dark:bg-surface-800" />
      </div>
    </div>
  );
}
