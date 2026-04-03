"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Downloads", value: "downloads" },
  { label: "Recently Updated", value: "updated" },
  { label: "Name", value: "name" },
] as const;

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "relevance";

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-surface-500">Sort:</span>
      <div className="flex gap-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSort(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              currentSort === option.value
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400"
                : "text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
