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
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Search packages" className="w-full">
      <div 
        className={`relative flex items-center bg-white border rounded-2xl transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
          isFocused 
            ? "border-[#1B5FED] shadow-[0_8px_30px_rgba(27,95,237,0.14)] -translate-y-0.5 hover:border-[#1B5FED]" 
            : "border-zinc-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
        }`}
      >
        <Search 
          className={`absolute left-4 h-5 w-5 transition-all duration-300 ${
            isFocused ? "text-[#1B5FED] scale-110 rotate-[10deg]" : "text-zinc-400"
          }`} 
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full bg-transparent pl-12 pr-12 text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-sans ${
            size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"
          }`}
          aria-label="Search packages"
        />
        <kbd 
          className={`absolute right-4 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold transition-all duration-300 sm:inline select-none ${
            isFocused 
              ? "border-[#1B5FED]/30 bg-[#1B5FED]/5 text-[#1B5FED] shadow-[1px_1px_0px_rgba(27,95,237,0.1)] scale-105" 
              : "border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-zinc-400 shadow-[1px_1px_0px_rgba(0,0,0,0.05)]"
          }`}
        >
          ⏎
        </kbd>
      </div>
    </form>
  );
}
