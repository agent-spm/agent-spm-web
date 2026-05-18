import type { Metadata } from "next";
import { registryApi } from "@/lib/registry/api";
import { getMockPackage, MOCK_PACKAGES } from "@/lib/registry/mock";
import { Download, Clock, ExternalLink, GitBranch, ChevronRight, Terminal, BookOpen, Scale, User, Tag } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import Link from "next/link";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex flex-wrap items-center gap-y-2 space-x-2 text-sm font-medium text-surface-500">
        <Link href="/search/" className="hover:text-brand-600 transition-colors">Packages</Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-surface-300" />
        <span className="text-surface-600">{namespace}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-surface-300" />
        <span className="text-surface-900 dark:text-surface-50">{name}</span>
      </nav>

      {/* Main Header Area */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-10">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 break-words max-w-full">
              <span className="text-surface-400 font-medium">{namespace}/</span>{name}
            </h1>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
              v{pkg.latestVersion}
            </span>
          </div>
          <p className="mt-4 text-xl leading-8 text-surface-600 dark:text-surface-300 max-w-3xl">
            {pkg.description}
          </p>
          
          {/* Quick Stats Row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-surface-500">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="font-medium text-surface-900 dark:text-surface-100">{formatNumber(pkg.weeklyDownloads)}</span>
              <span>weekly downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Published {timeAgo(pkg.updatedAt)}</span>
            </div>
            {pkg.license && (
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span>{pkg.license} License</span>
              </div>
            )}
          </div>
        </div>

        {/* Install Box */}
        <div className="shrink-0 w-full lg:w-80">
          <div className="rounded-xl border border-surface-200 bg-surface-50/50 p-1 dark:border-surface-800 dark:bg-surface-900/50 shadow-sm">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-0 px-4 py-3 shadow-sm ring-1 ring-inset ring-surface-200 dark:bg-surface-950 dark:ring-surface-800">
              <div className="flex items-center gap-2 min-w-0">
                <Terminal className="h-4 w-4 shrink-0 text-surface-400" />
                <code className="truncate font-mono text-sm font-medium text-surface-900 dark:text-surface-100">
                  {installCmd}
                </code>
              </div>
              <CopyButton text={installCmd} />
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8 border-surface-200 dark:border-surface-800" />

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
        {/* Left Column: README */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 border-b border-surface-200 pb-4 dark:border-surface-800">
              <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Readme</h2>
            </div>
            <div className="mt-6 prose prose-surface dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-pre:bg-surface-100 dark:prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-200 dark:prose-pre:border-surface-800">
              {/* In a real app, you'd use a markdown parser here. For now, formatting <pre> */}
              <pre className="whitespace-pre-wrap rounded-xl !bg-surface-50 !p-6 text-sm leading-relaxed text-surface-700 dark:!bg-surface-900/50 dark:text-surface-300 font-sans border border-surface-200 dark:border-surface-800 shadow-sm">
                {pkg.readme}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="space-y-8">
          {/* Metadata Section */}
          <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-4 uppercase tracking-wider">About</h3>
            <dl className="space-y-5">
              {pkg.author && (
                <div>
                  <dt className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4" /> Author
                  </dt>
                  <dd className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {pkg.author.name}
                  </dd>
                </div>
              )}
              {pkg.repositoryUrl && (
                <div>
                  <dt className="text-sm font-medium text-surface-500 flex items-center gap-2 mb-1.5">
                    <GitBranch className="h-4 w-4" /> Source
                  </dt>
                  <dd>
                    <Link href="/404/" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400">
                      GitHub Repository <ExternalLink className="inline-block h-3 w-3 ml-1" />
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <hr className="border-surface-200 dark:border-surface-800" />

          {/* Keywords Section */}
          {pkg.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Tag className="h-4 w-4 text-surface-400" /> Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {pkg.keywords.map((kw) => (
                  <Link 
                    key={kw} 
                    href={`/search/?q=${kw}`}
                    className="inline-flex items-center rounded-md bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <hr className="border-surface-200 dark:border-surface-800" />

          {/* Versions Section */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-4 uppercase tracking-wider">Version History</h3>
            <div className="flow-root">
              <ul className="-my-3 divide-y divide-surface-200 dark:divide-surface-800">
                {pkg.versions.map((v) => (
                  <li key={v.version} className="flex items-center justify-between py-3">
                    <span className="font-mono text-sm font-medium text-brand-600 dark:text-brand-400">v{v.version}</span>
                    <span className="text-xs text-surface-500">{timeAgo(v.publishedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
