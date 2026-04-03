import { REGISTRY_API_URL } from "@/lib/constants";
import type { Package, PackageSearchResponse } from "@/types/package";
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

    return this.fetch<PackageSearchResponse>(
      `/packages?${searchParams.toString()}`,
      { revalidate: 30 }
    );
  }

  async getFeaturedPackages(): Promise<PackageSearchResponse> {
    return this.fetch<PackageSearchResponse>("/packages/featured", {
      tags: ["featured-packages"],
      revalidate: 600,
    });
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
