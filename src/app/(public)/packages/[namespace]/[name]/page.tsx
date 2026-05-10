import type { Metadata } from "next";
import { registryApi } from "@/lib/registry/api";
import { getMockPackage, MOCK_PACKAGES } from "@/lib/registry/mock";
import { Download, Clock, ExternalLink, GitBranch, FileText } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import Link from "next/link";

// Pre-generate pages for known mock packages so static export works
export function generateStaticParams() {
  return MOCK_PACKAGES.map((pkg) => ({
    namespace: pkg.namespace,
    name: pkg.name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ namespace: string; name: string }>;
}): Promise<Metadata> {
  const { namespace, name } = await params;
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
  const { namespace, name } = await params;

  let pkg;
  try {
    pkg = await registryApi.getPackage(namespace, name);
  } catch {
    pkg = getMockPackage(namespace, name);
  }

  const installCmd = `spm install ${namespace}/${name}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-surface-400">
        <Link href="/search/" className="hover:text-brand-600 transition-colors">
          Packages
        </Link>
        <span>/</span>
        <span className="text-surface-600">{namespace}</span>
        <span>/</span>
        <span className="font-medium text-surface-900 dark:text-surface-50">{name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
            <span className="text-surface-400 font-normal">{namespace}/</span>{name}
          </h1>
          <p className="mt-2 text-lg text-surface-500 max-w-2xl">{pkg.description}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-surface-200 bg-surface-50 px-3 py-1 font-mono text-sm text-surface-600 dark:border-surface-800 dark:bg-surface-900">
          v{pkg.latestVersion}
        </span>
      </div>

      {/* Install command */}
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-800 dark:bg-surface-900">
        <code className="flex-1 font-mono text-sm text-surface-700 dark:text-surface-300">
          $ {installCmd}
        </code>
        <CopyButton text={installCmd} />
      </div>

      {/* Stats bar */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm text-surface-500">
        <div className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span><strong className="text-surface-900 dark:text-surface-100">{formatNumber(pkg.totalDownloads)}</strong> total downloads</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span><strong className="text-surface-900 dark:text-surface-100">{formatNumber(pkg.weeklyDownloads)}</strong>/week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Updated {timeAgo(pkg.updatedAt)}</span>
        </div>
      </div>

      {/* Content grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main — Readme */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-surface-50 mb-4">
              <FileText className="h-5 w-5 text-surface-400" />
              README
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-surface-600 dark:text-surface-300 font-sans leading-relaxed">
                {pkg.readme}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-950">
            <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-3">Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-surface-400">License</dt>
                <dd className="font-medium text-surface-700 dark:text-surface-300">{pkg.license}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-surface-400">Author</dt>
                <dd className="font-medium text-surface-700 dark:text-surface-300">{pkg.author.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-surface-400">Created</dt>
                <dd className="font-medium text-surface-700 dark:text-surface-300">{timeAgo(pkg.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Links */}
          {pkg.repositoryUrl && (
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-950">
              <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-3">Links</h3>
              <a
                href={pkg.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                Repository
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </div>
          )}

          {/* Keywords */}
          {pkg.keywords.length > 0 && (
            <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-950">
              <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {pkg.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-900"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Versions */}
          <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-950">
            <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-3">Versions</h3>
            <ul className="space-y-2">
              {pkg.versions.map((v) => (
                <li key={v.version} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-surface-700 dark:text-surface-300">v{v.version}</span>
                  <span className="text-surface-400 text-xs">{timeAgo(v.publishedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

