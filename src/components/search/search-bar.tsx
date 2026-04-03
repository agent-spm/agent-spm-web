"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

interface SearchBarProps {
  size?: "sm" | "lg";
  placeholder?: string;
}

export function SearchBar({
  size = "lg",
  placeholder = "Search packages…",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-surface-200 bg-surface-0 pl-12 pr-4 text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50 ${
            size === "lg" ? "py-4 text-lg" : "py-2.5 text-sm"
          }`}
        />
        <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-surface-300 bg-surface-100 px-1.5 py-0.5 font-mono text-xs text-surface-400 dark:border-surface-700 dark:bg-surface-800 sm:inline">
          ⏎
        </kbd>
      </div>
    </form>
  );
}
