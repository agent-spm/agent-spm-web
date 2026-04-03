import { Download, GitBranch, Scale, ExternalLink } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";
import type { Package } from "@/types/package";

interface PackageHeaderProps {
  pkg: Package;
}

export function PackageHeader({ pkg }: PackageHeaderProps) {
  return (
    <div className="border-b border-surface-200 bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              <span className="text-surface-400">{pkg.namespace}/</span>
              {pkg.name}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-surface-500">
              {pkg.description}
            </p>
          </div>
          <span className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-sm font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-400">
            v{pkg.latestVersion}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-surface-500">
          <span className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            {formatNumber(pkg.totalDownloads)} downloads
          </span>
          <span className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            {pkg.license || "Unlicensed"}
          </span>
          <span>Published {formatDate(pkg.updatedAt)}</span>
          {pkg.repositoryUrl && (
            <a
              href={pkg.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand-500 transition-colors hover:text-brand-600"
            >
              <GitBranch className="h-4 w-4" />
              Repository
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
