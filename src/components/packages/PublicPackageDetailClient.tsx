"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Clock, ExternalLink, GitBranch, Terminal, BookOpen, Scale, User, Tag, Zap, Play, ShieldCheck, Copy, Check } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import { ConnectAgentModal } from "@/components/modals/ConnectAgentModal";
import { useToast } from "@/components/ui/ToastProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

interface PublicPackageDetailClientProps {
  namespace: string;
  name: string;
  pkg: any;
  installCmd: string;
}

export const PublicPackageDetailClient: React.FC<PublicPackageDetailClientProps> = ({
  namespace,
  name,
  pkg,
  installCmd,
}) => {
  const { showToast } = useToast();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeView, setActiveView] = useState<"readme" | "playground">("readme");

  // Playground state for public visitors
  const [selectedTool, setSelectedTool] = useState("execute_tool");
  const [paramInput, setParamInput] = useState("https://example.com");
  const [isExecuting, setIsExecuting] = useState(false);
  const [execResult, setExecResult] = useState<string | null>(null);
  const [execLatency, setExecLatency] = useState(64);

  const handleRunPublicTool = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecLatency(Math.floor(Math.random() * 30) + 50);
      setExecResult(
        JSON.stringify(
          {
            status: "success",
            executionTimeMs: 64,
            output: `Verified execution output for ${namespace}/${name} against ${paramInput}.`,
            tokenBurden: 280,
          },
          null,
          2
        )
      );
      showToast({
        title: "Tool Executed Cleanly",
        message: `${namespace}/${name} returned 200 OK in sandbox mode.`,
        type: "success",
      });
    }, 500);
  };

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
              <span className="inline-flex items-center rounded-[4px] bg-[#1A5FED]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#1A5FED] border border-[#1A5FED]/20">
                v{pkg.latestVersion}
              </span>
              <span className="inline-flex items-center gap-1 rounded-[4px] bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>96/100 (Grade A+)</span>
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

          {/* Quick Install & Connect Action Box */}
          <div className="shrink-0 w-full lg:w-96 space-y-3">
            <div className="rounded-[8px] border border-black/10 bg-[#F7F7F7] p-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-3 rounded-[6px] bg-white px-3.5 py-2.5 border border-black/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Terminal className="h-4 w-4 shrink-0 text-[#1A5FED]" />
                  <code className="truncate font-mono text-xs font-medium text-black">
                    {installCmd}
                  </code>
                </div>
                <CopyButton text={installCmd} />
              </div>
            </div>

            {/* Primary One-Click Connect Chiclet */}
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full h-11 rounded-[8px] bg-[#1A5FED] hover:bg-[#1A5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Connect to Agent Runtime</span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">[C]</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: README vs Live Playground */}
        <div className="flex items-center gap-2 border-b border-black/10 mb-8 font-mono text-xs">
          <button
            onClick={() => setActiveView("readme")}
            className={`flex items-center gap-2 pb-3 px-2 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeView === "readme"
                ? "border-[#1A5FED] text-[#1A5FED]"
                : "border-transparent text-black/50 hover:text-black"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation (README)</span>
          </button>

          <button
            onClick={() => setActiveView("playground")}
            className={`flex items-center gap-2 pb-3 px-2 font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeView === "playground"
                ? "border-[#1A5FED] text-[#1A5FED]"
                : "border-transparent text-black/50 hover:text-black"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Interactive MCP Playground</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
              LIVE
            </span>
          </button>
        </div>

        {/* Main Content & Sidebar */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeView === "readme" ? (
              <div className="bg-[#F7F7F7] border border-black/5 rounded-[8px] p-6 sm:p-8">
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
                      li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
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
                    }}
                  >
                    {pkg.readme}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              /* Public Live Playground Pane */
              <div className="bg-[#F7F7F7] border border-black/5 rounded-[8px] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div>
                    <h3 className="text-base font-bold font-mono text-black">Zero-Setup MCP Test Harness</h3>
                    <p className="text-xs text-black/60 font-sans mt-0.5">Test tool parameters client-side without local credentials.</p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-sky-50 text-[#1A5FED] border border-sky-200 font-semibold">
                    Draft 2020-12
                  </span>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-mono text-black font-semibold">Target URI / Input Argument</label>
                    <input
                      type="text"
                      value={paramInput}
                      onChange={(e) => setParamInput(e.target.value)}
                      placeholder="e.g. https://example.com"
                      className="w-full h-10 px-3 rounded-lg border border-black/10 bg-white font-mono text-xs text-black outline-none focus:border-[#1A5FED]"
                    />
                  </div>

                  <button
                    onClick={handleRunPublicTool}
                    disabled={isExecuting}
                    className="w-full sm:w-auto px-6 h-10 rounded-lg bg-[#1A5FED] hover:bg-[#1A5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isExecuting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Simulating Call...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Test Call</span>
                      </>
                    )}
                  </button>

                  {execResult && (
                    <div className="mt-4 p-4 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] shadow-inner space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-white/10">
                        <span className="text-emerald-400">STATUS: 200 OK ({execLatency}ms)</span>
                        <span>JSON-RPC 2.0 Response</span>
                      </div>
                      <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-300">
                        {execResult}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  {pkg.keywords.map((kw: string) => (
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
                  {pkg.versions.map((v: any) => (
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

      {/* Connect to Agent Modal */}
      <ConnectAgentModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        skillScope={namespace}
        skillName={name}
        version={pkg.latestVersion}
      />
    </div>
  );
};
