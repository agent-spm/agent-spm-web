import type { Metadata } from "next";
import { APP_URL, APP_NAME } from "@/lib/constants";
import type { Package } from "@/types/package";

export function buildPackageMetadata(pkg: Package): Metadata {
  const title = `${pkg.namespace}/${pkg.name}`;
  const description =
    pkg.description || `${title} — an AI agent skill package on SPM.`;
  const url = `${APP_URL}/packages/${pkg.namespace}/${pkg.name}`;

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${APP_NAME}`,
      description,
    },
    keywords: [
      pkg.namespace,
      pkg.name,
      "spm",
      "skills package",
      "ai agent",
      ...pkg.keywords,
    ],
  };
}

export function buildSearchMetadata(query?: string): Metadata {
  const title = query ? `Search: "${query}"` : "Search Packages";
  const description = query
    ? `Search results for "${query}" on SPM — the Skills Package Manager.`
    : "Search and discover AI agent skill packages on SPM.";

  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}
