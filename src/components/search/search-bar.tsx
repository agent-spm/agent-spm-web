"use client";

import { Search, X, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

interface SearchBarProps {
  size?: "sm" | "lg";
  placeholder?: string;
}

export function SearchBar({
  size = "lg",
  placeholder = "Search packages, skills, MCP servers…",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const navigateWithQuery = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.push(qs ? `/search?${qs}` : "/search");
    },
    [router, searchParams]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      navigateWithQuery(query);
    },
    [query, navigateWithQuery]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    navigateWithQuery("");
  }, [navigateWithQuery]);

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Search packages" className="w-full">
      <div 
        className={`relative flex items-center bg-white border rounded-[8px] transition-all duration-200 ${
          isFocused 
            ? "border-[#1A5FED] shadow-[0_6px_24px_rgba(26,95,237,0.12)] -translate-y-0.5" 
            : "border-black/10 hover:border-black/20 shadow-xs"
        }`}
      >
        <Search 
          className={`absolute left-3.5 sm:left-4 h-5 w-5 transition-all duration-200 pointer-events-none ${
            isFocused ? "text-[#1A5FED]" : "text-black/40"
          }`} 
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full min-w-0 bg-transparent pl-10 sm:pl-12 ${
            query ? "pr-20 sm:pr-32" : "pr-12 sm:pr-24"
          } text-black placeholder:text-black/40 focus:outline-none font-sans appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
            size === "lg" ? "py-3.5 sm:py-4 text-sm sm:text-base" : "py-2.5 text-sm"
          }`}
          aria-label="Search packages"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-11 sm:right-22 inline-flex h-7 w-7 items-center justify-center rounded-full text-black/45 hover:bg-black/5 hover:text-black transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Run package search"
          className="sm:hidden absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#1A5FED] text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <kbd 
          className={`absolute right-4 hidden rounded-[2px] border px-2 py-0.5 font-mono text-[10px] font-bold transition-all sm:inline select-none ${
            isFocused 
              ? "border-[#1A5FED]/30 bg-[#1A5FED]/10 text-[#1A5FED]" 
              : "border-black/10 bg-[#F7F7F7] text-black/50"
          }`}
        >
          ENTER ⏎
        </kbd>
      </div>
    </form>
  );
}
