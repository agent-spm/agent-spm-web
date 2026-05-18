import type { Metadata } from "next";
import { registryApi } from "@/lib/registry/api";
import { getMockPackage, MOCK_PACKAGES } from "@/lib/registry/mock";
import { Download, Clock, ExternalLink, GitBranch, ChevronRight, Terminal, BookOpen, Scale, User, Tag } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

export async function generateStaticParams() {
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
    // Fetch live packages from the backend registry to automatically pre-render them during build-time
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
  
  // Clean parameter lists, removing duplicate entries if any
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
            <div className="mt-6 prose prose-surface dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                components={{
                  // Premium typography styling
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 mt-8 mb-4 border-b border-surface-200 dark:border-surface-800 pb-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold tracking-tight text-surface-800 dark:text-surface-100 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-base leading-relaxed text-surface-600 dark:text-surface-300 my-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 my-4 text-surface-600 dark:text-surface-300 text-base">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 my-4 text-surface-600 dark:text-surface-300 text-base">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed pl-1">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-surface-900 dark:text-surface-50">
                      {children}
                    </strong>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline hover:text-brand-700 transition-colors">
                      {children}
                    </a>
                  ),
                  // Premium styled pre for full-block code highlighting
                  pre: ({ children }) => (
                    <pre className="rounded-xl !bg-surface-50 !p-6 text-sm leading-relaxed text-surface-700 dark:!bg-surface-900/50 dark:text-surface-300 border border-surface-200 dark:border-surface-800 shadow-sm overflow-x-auto font-mono my-6">
                      {children}
                    </pre>
                  ),
                  // Inline code formatting to make it stand out beautifully
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
                          {children}
                        </code>
                      );
                    }
                    return <code className={className}>{children}</code>;
                  },
                  // Clean responsive developer tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border border-surface-200 dark:border-surface-800 rounded-xl">
                      <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-surface-50 dark:bg-surface-900/50">{children}</thead>,
                  th: ({ children }) => <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">{children}</th>,
                  td: ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-surface-100">{children}</td>,
                }}
              >
                {pkg.readme}
              </ReactMarkdown>
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
