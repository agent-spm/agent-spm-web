import { formatDate, formatNumber } from "@/lib/utils";
import type { PackageVersion } from "@/types/package";

interface PackageVersionsProps {
  versions: PackageVersion[];
}

export function PackageVersions({ versions }: PackageVersionsProps) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950">
      <div className="border-b border-surface-200 px-6 py-4 dark:border-surface-800">
        <h2 className="font-semibold text-surface-900 dark:text-surface-50">
          Versions ({versions.length})
        </h2>
      </div>
      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {versions.map((version) => (
          <div
            key={version.version}
            className="flex items-center justify-between px-6 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-surface-900 dark:text-surface-50">
                {version.version}
              </span>
              {version === versions[0] && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-surface-400">
              <span>{formatNumber(version.downloads)} downloads</span>
              <span>{formatDate(version.publishedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
