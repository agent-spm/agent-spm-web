"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
    router.push(`/search/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 select-none overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
      <span className="text-xs font-semibold uppercase tracking-wider text-black/40 font-mono whitespace-nowrap">
        Sort by:
      </span>
      <div className="inline-flex gap-1 bg-[#F7F7F7] p-1 rounded-[4px] border border-black/5 shrink-0 font-mono">
        {SORT_OPTIONS.map((option) => {
          const isActive = currentSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`rounded-[2px] px-3.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer border ${
                isActive
                  ? "bg-white text-[#1A5FED] shadow-xs border-black/10 font-bold"
                  : "border-transparent text-black/60 hover:text-black"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
