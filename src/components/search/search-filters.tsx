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
    <div className="flex items-center gap-3 select-none">
      <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 font-mono">
        Sort by:
      </span>
      <div className="inline-flex gap-1 bg-surface-100/80 p-1 rounded-xl border border-surface-200/40">
        {SORT_OPTIONS.map((option) => {
          const isActive = currentSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-[#1B5FED] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-surface-200/40 scale-[1.02]"
                  : "text-surface-500 hover:text-surface-900 hover:bg-white/40"
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
