"use client";

import React, { useState, useEffect, useId, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Check,
  Copy,
  Download,
  ExternalLink,
  Plus,
  PackageCheck,
  ShieldCheck,
  Shield,
  X,
} from "lucide-react";
import { DemoDarkShell, DemoTabList } from "./DemoChrome";
import {
  DemoPackageItem,
  DemoPackageDetail,
  AgentClientTarget,
  buildClientConfigSnippet,
  buildSpmYamlPreview,
  formatCompactBytes,
  formatReadmeSourceLabel,
  pickUniqueDemoPackages,
} from "./demo-types";

export default function ExtensionRegistryDemo({
  initialPackages,
}: {
  initialPackages: DemoPackageItem[];
}) {
  const uid = useId();
  const searchInputId = `${uid}-ext-search`;

  const uniqueQuickPackages = useMemo(
    () => pickUniqueDemoPackages(initialPackages, 8),
    [initialPackages]
  );

  const [packages, setPackages] = useState<DemoPackageItem[]>(uniqueQuickPackages);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [selectedPkg, setSelectedPkg] = useState<DemoPackageItem>(uniqueQuickPackages[0]);
  const [detail, setDetail] = useState<DemoPackageDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [installedIds, setInstalledIds] = useState<string[]>([uniqueQuickPackages[0]?.id].filter(Boolean));
  const [activeEditorTab, setActiveEditorTab] = useState<"config" | "manifest" | "skillmd">("config");
  const [clientTarget, setClientTarget] = useState<AgentClientTarget>("cursor");
  const [mobilePane, setMobilePane] = useState<"explorer" | "editor">("editor");
  const [copiedState, setCopiedState] = useState(false);

  useEffect(() => {
    if (!selectedPkg) return;
    const controller = new AbortController();
    setIsLoadingDetail(true);

    fetch(`/api/demo/inspect?package=${encodeURIComponent(selectedPkg.fullName)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.mode === "package" && data.package) {
          setDetail(data.package);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDetail(false);
        }
      });

    return () => controller.abort();
  }, [selectedPkg]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setPackages(uniqueQuickPackages);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/demo/inspect?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.mode === "search" && Array.isArray(data.packages)) {
            setPackages(pickUniqueDemoPackages(data.packages, 8));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, uniqueQuickPackages]);

  const workspaceInstalled = useMemo(
    () =>
      packages
        .concat(uniqueQuickPackages)
        .filter(
          (item, index, arr) =>
            installedIds.includes(item.id) && arr.findIndex((x) => x.id === item.id) === index
        ),
    [packages, uniqueQuickPackages, installedIds]
  );

  const isInstalled = installedIds.includes(selectedPkg.id);
  const toggleInstall = () => {
    setInstalledIds((prev) =>
      prev.includes(selectedPkg.id)
        ? prev.filter((id) => id !== selectedPkg.id)
        : [...prev, selectedPkg.id]
    );
  };

  const editorCode =
    activeEditorTab === "config"
      ? buildClientConfigSnippet(clientTarget, selectedPkg)
      : activeEditorTab === "manifest"
        ? buildSpmYamlPreview(selectedPkg, detail, workspaceInstalled)
        : detail?.readmeSnippet ||
          `# ${selectedPkg.fullName}\n\n${selectedPkg.description}\n\nRun: spm install ${selectedPkg.fullName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(editorCode);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 1800);
  };

  const pkgHref = `/packages/${encodeURIComponent(selectedPkg.namespace)}/${encodeURIComponent(selectedPkg.name)}`;
  const downloadHref = `/api/packages/download?package=${encodeURIComponent(selectedPkg.fullName)}&version=${encodeURIComponent(selectedPkg.latestVersion)}`;

  return (
    <DemoDarkShell
      title="[IDE EXTENSION] workspace.spm"
      badgeText={`LIVE REGISTRY • ${packages.length} SKILLS`}
      badgeTone="blue"
      headerRight={
        <Link
          href="/search"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-[#1B5FED] hover:border-[#1B5FED] text-white font-mono text-[11px] uppercase transition-colors"
        >
          <span>[S] Search</span>
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </Link>
      }
    >
      {/* Mobile-only pane switcher */}
      <div className="flex md:hidden border-b border-zinc-800 bg-[#111113] shrink-0">
        <button
          type="button"
          onClick={() => setMobilePane("explorer")}
          className={`flex-1 min-h-[38px] font-mono text-xs border-b-2 transition-colors cursor-pointer ${
            mobilePane === "explorer"
              ? "border-[#1B5FED] text-white font-semibold"
              : "border-transparent text-zinc-400"
          }`}
        >
          1. Browse Skills ({packages.length})
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("editor")}
          className={`flex-1 min-h-[38px] font-mono text-xs border-b-2 transition-colors cursor-pointer ${
            mobilePane === "editor"
              ? "border-[#1B5FED] text-white font-semibold"
              : "border-transparent text-zinc-400"
          }`}
        >
          2. {selectedPkg.name}
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Explorer Pane */}
        <div
          className={`md:col-span-5 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0D0D10] flex flex-col min-h-0 min-w-0 overflow-hidden ${
            mobilePane === "explorer" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-2.5 border-b border-zinc-800 space-y-2 shrink-0">
            <div className="relative">
              <label htmlFor={searchInputId} className="sr-only">
                Search live Agent SPM skills
              </label>
              <Search
                className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id={searchInputId}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter skills (e.g. antiskill)..."
                className="w-full min-h-[36px] bg-[#09090B] border border-zinc-800 rounded-[4px] pl-8 pr-7 py-1.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1B5FED]"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear demo skill search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5" aria-label="Featured skills">
              {uniqueQuickPackages.slice(0, 3).map((quick) => (
                <button
                  key={quick.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPkg(quick);
                    setMobilePane("editor");
                  }}
                  className={`px-2 py-1 rounded-[3px] font-mono text-[10px] border transition-colors cursor-pointer ${
                    selectedPkg.id === quick.id
                      ? "bg-[#1B5FED] border-[#1B5FED] text-white font-semibold"
                      : "bg-[#18181B] border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {quick.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-zinc-800/70">
            {isSearching ? (
              <div className="p-4 font-mono text-xs text-zinc-400">
                Querying live registry...
              </div>
            ) : packages.length === 0 ? (
              <div className="p-4 space-y-2">
                <p className="font-mono text-xs text-zinc-400">
                  No live packages matched &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2.5 py-1 rounded-[3px] bg-zinc-800 text-white font-mono text-[11px] hover:bg-zinc-700 cursor-pointer"
                >
                  Reset filter
                </button>
              </div>
            ) : (
              packages.slice(0, 8).map((item) => {
                const active = item.id === selectedPkg.id;
                const installed = installedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedPkg(item);
                      setMobilePane("editor");
                    }}
                    className={`w-full text-left px-3 py-2.5 transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                      active
                        ? "bg-[#1B5FED]/15 border-l-2 border-[#1B5FED]"
                        : "hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.verified ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
                        )}
                        <span className="font-mono text-xs font-semibold text-white truncate">
                          {item.fullName}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 font-mono text-[10px] gap-1">
                      <span className="text-zinc-300">v{item.latestVersion}</span>
                      {installed && (
                        <span className="text-emerald-400 font-semibold">Pinned</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Workbench */}
        <div
          className={`md:col-span-7 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[#09090B] ${
            mobilePane === "editor" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-zinc-800 bg-[#111113] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                  {selectedPkg.fullName}
                </span>
                <span className="px-1.5 py-0.5 rounded-[3px] bg-zinc-800 font-mono text-[10px] text-zinc-200">
                  v{selectedPkg.latestVersion}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {detail ? formatCompactBytes(detail.sizeBytes) : isLoadingDetail ? "Syncing..." : ""}
                </span>
              </div>
              <div className="font-mono text-[10px] text-zinc-400 mt-0.5 truncate">
                {detail?.integrity && detail.integrity !== "unrecorded"
                  ? `SHA-256: ${detail.integrity.slice(0, 26)}…`
                  : "Public registry metadata"}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={toggleInstall}
                className={`min-h-[30px] px-2.5 py-1 rounded-[3px] font-mono text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  isInstalled
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                    : "bg-[#1B5FED] text-white hover:bg-[#1B5FED]/90"
                }`}
              >
                {isInstalled ? (
                  <>
                    <PackageCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pinned</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pin Skill</span>
                  </>
                )}
              </button>

              <a
                href={downloadHref}
                download
                className="min-h-[30px] px-2.5 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-[11px] inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3 text-[#609CFF]" aria-hidden="true" />
                <span>.tgz</span>
              </a>

              <Link
                href={pkgHref}
                className="min-h-[30px] px-2.5 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-[11px] inline-flex items-center gap-1"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <DemoTabList
            idPrefix={`${uid}-ext`}
            ariaLabel="Extension preview panes"
            activeId={activeEditorTab}
            onSelect={(id) => setActiveEditorTab(id as "config" | "manifest" | "skillmd")}
            tabs={[
              { id: "config", label: "Agent Config" },
              { id: "manifest", label: "spm.yaml Lock" },
              {
                id: "skillmd",
                label: detail?.readmeSource === "github-skill" ? "SKILL.md (GitHub)" : "Skill Guide",
              },
            ]}
          />

          <div
            role="tabpanel"
            aria-labelledby={`${uid}-ext-tab-${activeEditorTab}`}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-800 bg-[#0D0D10] shrink-0 flex-wrap">
              {activeEditorTab === "config" ? (
                <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Target AI editor">
                  {(
                    [
                      { id: "cursor", label: "Cursor" },
                      { id: "claude", label: "Claude" },
                      { id: "vscode", label: "VS Code" },
                      { id: "antigravity", label: "Antigravity" },
                    ] as const
                  ).map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setClientTarget(target.id)}
                      className={`px-2 py-1 rounded-[3px] font-mono text-[10px] transition-colors cursor-pointer ${
                        clientTarget === target.id
                          ? "bg-white text-black font-semibold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="font-mono text-[10px] text-zinc-400">
                  {activeEditorTab === "manifest"
                    ? `${workspaceInstalled.length} skill(s) pinned in workspace`
                    : `Source: ${formatReadmeSourceLabel(detail?.readmeSource)}`}
                </span>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[28px] px-2.5 py-1 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-[10px] inline-flex items-center gap-1 cursor-pointer ml-auto"
              >
                {copiedState ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="flex-1 min-h-0 overflow-auto p-3.5 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
              <code>{editorCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </DemoDarkShell>
  );
}
