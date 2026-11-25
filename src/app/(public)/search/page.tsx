import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { buildSearchMetadata } from "@/lib/seo/metadata";
import { registryApi } from "@/lib/registry/api";
import type { PackageSearchResponse } from "@/types/package";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return buildSearchMetadata(params.q || "");
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const sort =
    params.sort === "updated" || params.sort === "name" || params.sort === "downloads"
      ? params.sort
      : "relevance";
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const pageSize = 60;

  // Fetch from the real registry API with graceful fallback if unavailable
  let searchResponse: PackageSearchResponse = {
    packages: [],
    total: 0,
    page,
    pageSize,
  };
  try {
    searchResponse = await registryApi.searchPackages({
      query,
      sort,
      page,
      pageSize,
    });
  } catch (error) {
    console.warn(
      "Registry API search unavailable:",
      error instanceof Error ? error.message : String(error)
    );
  }

  const results = {
    packages: searchResponse.packages || [],
    total: searchResponse.total || 0,
    page,
    pageSize,
  };

  return (
    <div className="w-full min-h-[calc(100dvh-140px)] bg-white text-black font-sans pb-16 sm:pb-20">
      {/* Editorial Search Header */}
      <div className="relative pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F7F7] px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-black/70">
          <span className="w-2 h-2 rounded-full bg-[#1A5FED]" />
          AGENT SKILLS REGISTRY
        </div>

        <h1
          className="font-instrument-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.05] italic font-normal tracking-tight text-black mb-4 select-none"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Explore Skills &amp; MCPs.
        </h1>

        <p className="font-sans text-sm sm:text-lg text-black/60 max-w-xl mx-auto leading-relaxed mb-6 sm:mb-8">
          Discover battle-tested procedural knowledge, tools, and MCP context packages for your AI agents.
        </p>

        {/* Centered Search Bar */}
        <div className="max-w-2xl mx-auto">
          <Suspense>
            <SearchBar size="lg" />
          </Suspense>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 mt-4 sm:mt-6 min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Suspense>
            <SearchFilters />
          </Suspense>
        </div>

        <SearchResults
          packages={results.packages}
          total={results.total}
          query={query}
          page={results.page}
          pageSize={results.pageSize}
        />
      </div>
    </div>
  );
}
