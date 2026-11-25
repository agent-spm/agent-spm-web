import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { registryApi, PackageNotFoundError } from "@/lib/registry/api";
import { getMockPackage, MOCK_PACKAGES } from "@/lib/registry/mock";
import { PublicPackageDetailClient } from "@/components/packages/PublicPackageDetailClient";

export const dynamic = "force-dynamic";

const SHOWCASE_PACKAGES = new Set([
  "@spm/env-wizard",
  "@spm/git-hero",
  "@spm/ghost-scanner",
  "@lakshit/web2-ui",
  "@daksh/system-design",
  "@rahul/web2-security",
]);

export async function generateStaticParams() {
  if (process.env.STATIC_EXPORT !== "true") {
    return [];
  }
  const paramsList = [
    ...MOCK_PACKAGES.map((pkg) => ({
      namespace: pkg.namespace,
      name: pkg.name,
    })),
    // Power skills from dashboard & README
    { namespace: "@spm", name: "env-wizard" },
    { namespace: "@spm", name: "git-hero" },
    { namespace: "@spm", name: "ghost-scanner" },
    // Leaderboard entries
    { namespace: "@lakshit", name: "web2-ui" },
    { namespace: "@daksh", name: "system-design" },
    { namespace: "@rahul", name: "web2-security" },
  ];

  try {
    const response = await registryApi.searchPackages({ pageSize: 100 });
    if (response && response.packages) {
      response.packages.forEach((pkg) => {
        paramsList.push({
          namespace: pkg.namespace,
          name: pkg.name,
        });
      });
    }
  } catch (error) {
    console.warn("[SPM] Could not dynamically fetch packages during static param generation fallback:", error);
  }
  
  const uniqueParams = paramsList.filter(
    (item, index, self) =>
      self.findIndex(
        (t) => t.namespace === item.namespace && t.name === item.name
      ) === index
  );

  return uniqueParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ namespace: string; name: string }>;
}): Promise<Metadata> {
  const rawParams = await params;
  const namespace = decodeURIComponent(rawParams.namespace);
  const name = decodeURIComponent(rawParams.name);
  return {
    title: `${namespace}/${name} — SPM`,
    description: `Install and use the ${namespace}/${name} skill package for your AI agents.`,
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ namespace: string; name: string }>;
}) {
  const rawParams = await params;
  const namespace = decodeURIComponent(rawParams.namespace);
  const name = decodeURIComponent(rawParams.name);

  let pkg;
  try {
    pkg = await registryApi.getPackage(namespace, name);
  } catch (err) {
    const isMockKnown =
      MOCK_PACKAGES.some((m) => m.namespace === namespace && m.name === name) ||
      SHOWCASE_PACKAGES.has(`${namespace}/${name}`);
    if (isMockKnown) {
      pkg = getMockPackage(namespace, name);
    } else if (err instanceof PackageNotFoundError) {
      notFound();
    } else {
      throw err;
    }
  }

  const canonicalName = name.startsWith("@") && name.includes("/") ? name.split("/")[1] : name;
  const installTarget = namespace && namespace !== "@agent-spm" ? `${namespace}/${canonicalName}` : canonicalName;
  const installCmd = `spm install ${installTarget}`;

  return (
    <PublicPackageDetailClient
      namespace={namespace}
      name={name}
      pkg={pkg}
      installCmd={installCmd}
    />
  );
}
