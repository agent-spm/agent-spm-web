import { REGISTRY_API_URL } from "@/lib/constants";
import type { Package, PackageSearchResponse } from "@/types/package";
import { MOCK_PACKAGES } from "./mock";
import type { DashboardAnalytics } from "@/types/analytics";

class RegistryApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = REGISTRY_API_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    path: string,
    options?: RequestInit & { tags?: string[]; revalidate?: number }
  ): Promise<T> {
    const { tags, revalidate, ...fetchOptions } = options ?? {};
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...fetchOptions,
      next: {
        tags,
        revalidate: revalidate ?? 60,
      },
    });

    if (!res.ok) {
      throw new Error(
        `Registry API error: ${res.status} ${res.statusText} for ${path}`
      );
    }

    return res.json() as Promise<T>;
  }

  async getPackage(namespace: string, name: string): Promise<Package> {
    return this.fetch<Package>(`/packages/${namespace}/${name}`, {
      tags: [`package-${namespace}-${name}`],
      revalidate: 300,
    });
  }

  async searchPackages(params: {
    query?: string;
    page?: number;
    pageSize?: number;
    sort?: "downloads" | "updated" | "name";
  }): Promise<PackageSearchResponse> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set("q", params.query);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params.sort) searchParams.set("sort", params.sort);

    try {
      return await this.fetch<PackageSearchResponse>(
        `/packages/search?${searchParams.toString()}`,
        { revalidate: 30 }
      );
    } catch (e) {
      console.warn(`[SPM] API unavailable — using mock data for search (${e instanceof Error ? e.message : e})`);
      let results = MOCK_PACKAGES;
      if (params.query) {
        const q = params.query.toLowerCase();
        results = results.filter(p => p.name.includes(q) || p.namespace.includes(q) || p.description?.toLowerCase().includes(q));
      }
      return {
        packages: results,
        total: results.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      };
    }
  }

  async getFeaturedPackages(): Promise<PackageSearchResponse> {
    try {
      return await this.fetch<PackageSearchResponse>("/packages/featured", {
        tags: ["featured-packages"],
        revalidate: 600,
      });
    } catch (e) {
      console.warn(`[SPM] API unavailable — using mock data for featured (${e instanceof Error ? e.message : e})`);
      return {
        packages: MOCK_PACKAGES.slice(0, 3),
        total: Math.min(MOCK_PACKAGES.length, 3),
        page: 1,
        pageSize: 3,
      };
    }
  }

  async getDashboardAnalytics(
    token: string,
    period: "7d" | "30d" | "90d" = "30d"
  ): Promise<DashboardAnalytics> {
    return this.fetch<DashboardAnalytics>(
      `/analytics/dashboard?period=${period}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        revalidate: 0,
      }
    );
  }
}

export const registryApi = new RegistryApiClient();
