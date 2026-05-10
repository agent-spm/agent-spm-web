"use client";

import { Download, Clock } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { PackageSearchResult } from "@/types/package";

interface PackageCardProps {
  pkg: PackageSearchResult;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const installCmd = `spm install ${pkg.namespace}/${pkg.name}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
  };

  return (
    <div
      className="group block rounded-xl border border-surface-200 bg-surface-0 p-5 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 dark:border-surface-800 dark:bg-surface-950 dark:hover:border-brand-700 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-surface-900 transition-colors group-hover:text-brand-600 dark:text-surface-50 dark:group-hover:text-brand-400">
            <span className="text-surface-400">{pkg.namespace}/</span>
            {pkg.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-surface-500">
            {pkg.description}
          </p>
        </div>
        <span className="ml-3 shrink-0 rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 font-mono text-xs text-surface-500 dark:border-surface-800 dark:bg-surface-900">
          v{pkg.latestVersion}
        </span>
      </div>

      {/* Install command */}
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md bg-surface-100 px-3 py-1.5 font-mono text-xs text-surface-600 dark:bg-surface-900 dark:text-surface-300">
          $ {installCmd}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-surface-200 bg-surface-50 px-2 py-1.5 text-xs text-surface-500 transition-colors hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-brand-950 dark:hover:text-brand-400"
          title="Copy install command"
        >
          Copy
        </button>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5" />
          {formatNumber(pkg.weeklyDownloads)}/wk
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(pkg.updatedAt)}
        </span>
        {pkg.author?.name && (
          <span className="ml-auto truncate">{pkg.author.name}</span>
        )}
      </div>

      {/* Keywords */}
      {pkg.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pkg.keywords.slice(0, 4).map((kw) => (
            <span
              key={kw}
              className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-900"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
