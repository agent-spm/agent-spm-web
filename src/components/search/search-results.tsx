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
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-lg font-semibold text-black">
          No packages found
        </h3>
        <p className="mt-2 text-zinc-500">
          {query
            ? `No results for "${query}". Try a different search term.`
            : "Start by searching for a package above."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
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
