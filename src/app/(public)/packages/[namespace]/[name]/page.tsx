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
  } catch {
    pkg = getMockPackage(namespace, name);
  }

  const installCmd = `spm install ${namespace}/${name}`;

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-white text-black font-sans pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-black/50">
          <Link href="/search/" className="hover:text-[#1A5FED] transition-colors font-semibold">
            [PACKAGES]
          </Link>
          <span className="text-black/30">/</span>
          <span className="text-black/60">{namespace}</span>
          <span className="text-black/30">/</span>
          <span className="text-black font-semibold">{name}</span>
        </nav>

        {/* Main Header Area */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-10 pb-8 border-b border-black/10">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black break-words max-w-full">
                <span className="text-black/40 font-normal">{namespace}/</span>{name}
              </h1>
              <span className="inline-flex items-center rounded-[2px] bg-[#1A5FED]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#1A5FED] border border-[#1A5FED]/20">
                v{pkg.latestVersion}
              </span>
            </div>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-black/70 max-w-3xl font-sans">
              {pkg.description}
            </p>
            
            {/* Quick Stats Row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-black/55">
              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4 text-black/40" />
                <span className="font-semibold text-black">{formatNumber(pkg.weeklyDownloads)}</span>
                <span>weekly downloads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-black/40" />
                <span>Published {timeAgo(pkg.updatedAt)}</span>
              </div>
              {pkg.license && (
                <div className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-black/40" />
                  <span>{pkg.license} License</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Install Command Box */}
          <div className="shrink-0 w-full lg:w-84">
            <div className="rounded-[6px] border border-black/10 bg-[#F7F7F7] p-2 shadow-xs">
              <div className="flex items-center justify-between gap-3 rounded-[4px] bg-white px-3.5 py-2.5 border border-black/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Terminal className="h-4 w-4 shrink-0 text-[#1A5FED]" />
                  <code className="truncate font-mono text-xs font-medium text-black">
                    {installCmd}
                  </code>
                </div>
                <CopyButton text={installCmd} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          {/* Left Column: README */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#F7F7F7] border border-black/5 rounded-[8px] p-6 sm:p-8">
              <div className="flex items-center gap-2 border-b border-black/10 pb-4 mb-6">
                <BookOpen className="h-4 w-4 text-[#1A5FED]" />
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-black">
                  [README.MD]
                </h2>
              </div>
              <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-[#1A5FED] prose-pre:bg-transparent prose-pre:p-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mt-8 mb-4 border-b border-black/10 pb-3 font-sans">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black mt-8 mb-4 font-sans">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold tracking-tight text-black mt-6 mb-3 font-sans">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm sm:text-base leading-relaxed text-black/75 my-4 font-sans">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 space-y-2 my-4 text-black/75 text-sm sm:text-base">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 space-y-2 my-4 text-black/75 text-sm sm:text-base">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed pl-1">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-black">
                        {children}
                      </strong>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-[#1A5FED] font-medium hover:underline transition-colors">
                        {children}
                      </a>
                    ),
                    pre: ({ children }) => (
                      <pre className="rounded-[4px] !bg-white !p-4 text-xs sm:text-sm leading-relaxed text-black border border-black/10 shadow-xs overflow-x-auto font-mono my-4">
                        {children}
                      </pre>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-white border border-black/10 px-1.5 py-0.5 rounded-[2px] text-xs font-mono font-medium text-[#1A5FED]">
                            {children}
                          </code>
                        );
                      }
                      return <code className={className}>{children}</code>;
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6 border border-black/10 rounded-[4px] bg-white">
                        <table className="min-w-full divide-y divide-black/10 text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-[#F7F7F7]">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold font-mono text-black/70 uppercase tracking-wider">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{children}</td>,
                  }}
                >
                  {pkg.readme}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="rounded-[8px] border border-black/5 bg-[#F7F7F7] p-5">
              <h3 className="text-xs font-bold text-black/60 mb-4 uppercase tracking-wider font-mono">
                [METADATA]
              </h3>
              <dl className="space-y-4 font-sans text-sm">
                {pkg.author && (
                  <div>
                    <dt className="text-xs text-black/45 flex items-center gap-1.5 mb-1 font-mono uppercase">
                      <User className="h-3.5 w-3.5" /> Author
                    </dt>
                    <dd className="font-medium text-black">
                      {pkg.author.name}
                    </dd>
                  </div>
                )}
                {pkg.repositoryUrl && (
                  <div>
                    <dt className="text-xs text-black/45 flex items-center gap-1.5 mb-1 font-mono uppercase">
                      <GitBranch className="h-3.5 w-3.5" /> Repository
                    </dt>
                    <dd>
                      <a href={pkg.repositoryUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1A5FED] hover:underline flex items-center gap-1">
                        GitHub Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Keywords Section */}
            {pkg.keywords && pkg.keywords.length > 0 && (
              <div className="rounded-[8px] border border-black/5 bg-[#F7F7F7] p-5">
                <h3 className="text-xs font-bold text-black/60 mb-4 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Tag className="h-3.5 w-3.5" /> [TAGS]
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.keywords.map((kw) => (
                    <Link 
                      key={kw} 
                      href={`/search/?q=${kw}`}
                      className="inline-flex items-center rounded-[2px] bg-white border border-black/10 px-2.5 py-1 font-mono text-xs font-medium text-black/75 transition-colors hover:border-[#1A5FED] hover:text-[#1A5FED]"
                    >
                      #{kw}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Versions Section */}
            <div className="rounded-[8px] border border-black/5 bg-[#F7F7F7] p-5">
              <h3 className="text-xs font-bold text-black/60 mb-4 uppercase tracking-wider font-mono">
                [VERSIONS]
              </h3>
              <div className="flow-root font-mono text-xs">
                <ul className="-my-2 divide-y divide-black/5">
                  {pkg.versions.map((v) => (
                    <li key={v.version} className="flex items-center justify-between py-2.5">
                      <span className="font-semibold text-[#1A5FED]">v{v.version}</span>
                      <span className="text-black/45">{timeAgo(v.publishedAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
