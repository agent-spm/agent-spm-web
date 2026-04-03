import { PackageCard } from "@/components/packages/package-card";
import type { PackageSearchResult } from "@/types/package";
import { Package } from "lucide-react";

interface SearchResultsProps {
  packages: PackageSearchResult[];
  total: number;
  query?: string;
}

export function SearchResults({ packages, total, query }: SearchResultsProps) {
  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-12 text-center dark:border-surface-800 dark:bg-surface-950">
        <Package className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-700" />
        <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
          No packages found
        </h3>
        <p className="mt-2 text-surface-500">
          {query
            ? `No results for "${query}". Try a different search term.`
            : "Start by searching for a package above."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-surface-500">
        {total.toLocaleString()} package{total !== 1 ? "s" : ""} found
        {query ? ` for "${query}"` : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
