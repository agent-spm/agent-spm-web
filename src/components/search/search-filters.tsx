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
    router.push(`/search/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 select-none overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono whitespace-nowrap">
        Sort by:
      </span>
      <div className="inline-flex gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
        {SORT_OPTIONS.map((option) => {
          const isActive = currentSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                isActive
                  ? "bg-white text-[#1B5FED] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-zinc-200/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/30"
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
