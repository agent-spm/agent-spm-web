import { APP_URL } from "@/lib/constants";
import type { Package } from "@/types/package";

export function generatePackageJsonLd(pkg: Package) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${pkg.namespace}/${pkg.name}`,
    description: pkg.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    softwareVersion: pkg.latestVersion,
    url: `${APP_URL}/packages/${pkg.namespace}/${pkg.name}`,
    author: {
      "@type": "Person",
      name: pkg.author.name,
      ...(pkg.author.email && { email: pkg.author.email }),
      ...(pkg.author.githubUsername && {
        url: `https://github.com/${pkg.author.githubUsername}`,
      }),
    },
    datePublished: pkg.createdAt,
    dateModified: pkg.updatedAt,
    license: pkg.license
      ? `https://spdx.org/licenses/${pkg.license}.html`
      : undefined,
    ...(pkg.repositoryUrl && {
      codeRepository: pkg.repositoryUrl,
    }),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/DownloadAction",
      userInteractionCount: pkg.totalDownloads,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    keywords: pkg.keywords.join(", "),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SPM — Skills Package Manager",
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description:
      "The open registry for AI agent skill packages. Discover, publish, and manage reusable agent capabilities.",
    sameAs: ["https://github.com/spm-dev"],
  };
}
