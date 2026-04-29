import { registryApi } from "@/lib/registry/api";
import { PackageCard } from "./package-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PackageSearchResult } from "@/types/package";

export async function FeaturedPackages() {
  let packages: PackageSearchResult[] = [];
  try {
    const response = await registryApi.getFeaturedPackages();
    packages = response.packages || [];
  } catch (error) {
    console.error(
      "Failed to fetch featured packages:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }

  if (packages.length === 0) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              Featured Packages
            </h2>
            <p className="mt-2 text-surface-500">
              Hand-picked skills to boost your agent&apos;s capabilities.
            </p>
          </div>
          <Link
            href="/search"
            className="group flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
