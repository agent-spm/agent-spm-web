import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { buildSearchMetadata } from "@/lib/seo/metadata";
import { registryApi } from "@/lib/registry/api";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildSearchMetadata(params.q);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  // Fetch from the real registry API
  const searchResponse = await registryApi.searchPackages({
    query,
    sort: params.sort as any,
    page: Number(params.page) || 1,
  });

  const results = {
    packages: searchResponse.packages,
    total: searchResponse.total,
    page: Number(params.page) || 1,
    pageSize: 20,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Suspense>
          <SearchBar size="lg" />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense>
          <SearchFilters />
        </Suspense>
      </div>

      <div className="mt-6">
        <SearchResults
          packages={results.packages}
          total={results.total}
          query={query}
        />
      </div>
    </div>
  );
}
