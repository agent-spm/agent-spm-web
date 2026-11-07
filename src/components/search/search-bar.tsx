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
  placeholder = "Search packages, skills, MCP servers…",
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
        className={`relative flex items-center bg-white border rounded-[8px] transition-all duration-200 ${
          isFocused 
            ? "border-[#1A5FED] shadow-[0_6px_24px_rgba(26,95,237,0.12)] -translate-y-0.5" 
            : "border-black/10 hover:border-black/20 shadow-xs"
        }`}
      >
        <Search 
          className={`absolute left-4 h-5 w-5 transition-all duration-200 ${
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
          className={`w-full bg-transparent pl-12 pr-12 text-black placeholder:text-black/40 focus:outline-none font-sans ${
            size === "lg" ? "py-4 text-base" : "py-2.5 text-sm"
          }`}
          aria-label="Search packages"
        />
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
