"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, Play } from "lucide-react";
import { SpmLogoMark } from "@/components/ui/SpmLogoMark";

const WindowsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const AppleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-1.03 2.76.99.08 2.05-.51 2.67-1.26z" />
  </svg>
);

const LinuxIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.002 0c-3.14 0-5.498 2.228-5.498 5.617 0 1.91.737 3.738 1.455 5.253-.47.643-1.08 1.357-1.77 2.12-.99 1.1-2.19 2.42-2.19 4.34 0 3.42 2.72 6.67 7.99 6.67 5.28 0 8.01-3.25 8.01-6.67 0-1.92-1.2-3.24-2.19-4.34-.69-.763-1.3-1.477-1.77-2.12.72-1.515 1.45-3.343 1.45-5.253 0-3.389-2.35-5.617-5.49-5.617z" />
  </svg>
);

type OsTarget = "macos" | "linux" | "windows";

const OS_SHELL_LABEL: Record<OsTarget, string> = {
  macos: "zsh • darwin",
  linux: "bash • linux",
  windows: "powershell.exe",
};

export const CTABlockSection = () => {
  const [osTarget, setOsTarget] = useState<OsTarget>("macos");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [liveDigest, setLiveDigest] = useState<string | null>(null);
  const [liveVersion, setLiveVersion] = useState<string>("1.0.0");
  const [isCheckingLive, setIsCheckingLive] = useState(false);

  useEffect(() => {
    if (!isAutoCycling) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
    }, 4200);
    return () => clearInterval(timer);
  }, [isAutoCycling]);

  const initCmd =
    osTarget === "windows"
      ? "npx agent-spm@latest init my-agent"
      : "npx spm init my-agent";
  const installCmd = "spm install @lakshitsoni26/antiskill";
  const connectCmd = "spm connect --client cursor";

  const stepCommands: Record<1 | 2 | 3, string> = {
    1: initCmd,
    2: installCmd,
    3: connectCmd,
  };

  const handleSelectStep = (step: 1 | 2 | 3) => {
    setIsAutoCycling(false);
    setActiveStep(step);
  };

  const handleSelectOs = (os: OsTarget) => {
    setIsAutoCycling(false);
    setOsTarget(os);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(stepCommands[activeStep]);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1800);
  };

  const handleVerifyLive = async () => {
    if (isCheckingLive) return;
    setIsAutoCycling(false);
    setActiveStep(2);
    setIsCheckingLive(true);
    try {
      const res = await fetch("/api/demo/inspect?package=@lakshitsoni26/antiskill");
      const data = await res.json();
      if (res.ok && data?.package) {
        setLiveVersion(data.package.latestVersion || "1.0.0");
        const digest = String(data.package.integrity || "");
        setLiveDigest(digest ? `${digest.slice(0, 22)}…` : "sha256:verified");
      }
    } catch {
      // Preserve clean fallback state on transient failure
    } finally {
      setIsCheckingLive(false);
    }
  };

  return (
    <section className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1120px] mx-auto">
        <div className="relative w-full min-h-[438px] bg-[#F7F7F7] rounded-[6px] border border-black/10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 shadow-sm overflow-hidden">
          {/* Left Column: Crisp Editorial Copy + OS Selector + Actions */}
          <div className="flex-1 min-w-0 max-w-xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <SpmLogoMark size={30} variant="badge" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] border border-black/10 bg-white font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1B5FED]">
                [CLI FOR ALL OS]
              </span>
            </div>

            <h2
              className="font-instrument-serif text-4xl sm:text-5xl lg:text-[54px] leading-[1.05] text-black font-normal italic tracking-tight mb-4"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              A Useful Agent Skills
              <br />
              Manager
            </h2>

            <p className="font-sans text-sm sm:text-base text-black/65 font-normal leading-relaxed mb-6 max-w-[470px]">
              Initialize workspaces, verify SHA-256 checksums, and install scoped MCP
              skills across Cursor, Claude, VS Code, and Antigravity in one command.
            </p>

            {/* Interactive OS Platform Selector */}
            <div className="flex flex-wrap items-center gap-2 mb-7">
              <span className="font-mono text-xs uppercase tracking-tight text-black/60 mr-1">
                Platform:
              </span>
              {(
                [
                  { id: "macos", label: "macOS", icon: <AppleIcon /> },
                  { id: "linux", label: "Linux", icon: <LinuxIcon /> },
                  { id: "windows", label: "Windows", icon: <WindowsIcon /> },
                ] as const
              ).map((platform) => {
                const selected = osTarget === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelectOs(platform.id)}
                    className={`min-h-[34px] px-2.5 py-1 rounded-[4px] border font-mono text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selected
                        ? "bg-black text-white border-black font-semibold"
                        : "bg-white text-black/75 border-black/15 hover:border-black/40 hover:text-black"
                    }`}
                  >
                    {platform.icon}
                    <span>{platform.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-[4px] bg-black hover:bg-[#1B5FED] text-white font-sans text-sm sm:text-base font-semibold shadow-sm transition-colors active:scale-98"
              >
                <span>Explore Skills</span>
                <span className="ml-2 font-mono text-sm" aria-hidden="true">→</span>
              </Link>

              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-[4px] border border-black/15 bg-white hover:border-black/40 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                CLI Docs
              </Link>
            </div>
          </div>

          {/* Right Column: High-Contrast Swiss Noir Interactive CLI Card */}
          <div
            style={{ colorScheme: "only dark", contain: "layout style" }}
            className="relative w-full max-w-full lg:w-[530px] min-h-[340px] sm:h-[364px] bg-[#09090B] text-zinc-100 rounded-[4px] border border-zinc-800 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col flex-shrink-0 min-w-0"
          >
            {/* Top Brand Blue Micro Hairline */}
            <div
              aria-hidden="true"
              className="h-[2px] w-full bg-gradient-to-r from-[#1B5FED] via-[#609CFF]/70 to-zinc-800 shrink-0"
            />

            {/* Header Bar */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#111113] border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <SpmLogoMark size={18} variant="badge" />
                <span className="font-mono text-xs font-medium text-zinc-100 truncate">
                  agent-spm-cli • {OS_SHELL_LABEL[osTarget]}
                </span>
              </div>

              <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded-[3px] border border-[#1B5FED]/50 bg-[#1B5FED]/20 text-[#9CC2FF] shrink-0">
                [v{liveVersion}]
              </span>
            </div>

            {/* Interactive Steps Workspace — All 3 stages stay cleanly balanced */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2 font-mono text-xs">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => handleSelectStep(1)}
                className={`w-full text-left p-2.5 rounded-[4px] border transition-colors cursor-pointer ${
                  activeStep === 1
                    ? "bg-[#1B5FED]/15 border-[#1B5FED]/60"
                    : "bg-[#111113]/70 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2 text-zinc-100 min-w-0">
                  <span className="text-[#609CFF] font-bold shrink-0">$</span>
                  <span className="truncate font-semibold">{initCmd}</span>
                </div>
                <div className="pl-4 mt-1 text-[11px] text-[#9CC2FF]">
                  ✔ Created agent workspace manifest (spm.yaml)
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => handleSelectStep(2)}
                className={`w-full text-left p-2.5 rounded-[4px] border transition-colors cursor-pointer ${
                  activeStep === 2
                    ? "bg-[#1B5FED]/15 border-[#1B5FED]/60"
                    : "bg-[#111113]/70 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2 text-zinc-100 min-w-0">
                  <span className="text-[#609CFF] font-bold shrink-0">$</span>
                  <span className="truncate font-semibold">{installCmd}</span>
                </div>
                <div className="pl-4 mt-1 text-[11px] text-emerald-300 truncate">
                  {liveDigest
                    ? `✔ Live DB verified v${liveVersion} (${liveDigest})`
                    : "✔ SHA-256 verified archive • linked into workspace"}
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => handleSelectStep(3)}
                className={`w-full text-left p-2.5 rounded-[4px] border transition-colors cursor-pointer ${
                  activeStep === 3
                    ? "bg-[#1B5FED]/15 border-[#1B5FED]/60"
                    : "bg-[#111113]/70 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2 text-zinc-100 min-w-0">
                  <span className="text-[#609CFF] font-bold shrink-0">$</span>
                  <span className="truncate font-semibold">{connectCmd}</span>
                </div>
                <div className="pl-4 mt-1 text-[11px] text-zinc-300">
                  ✔ Synced MCP runtime tools &amp; lockfile ready
                </div>
              </button>
            </div>

            {/* Crisp Footer Controls */}
            <div className="px-3.5 py-2.5 bg-[#111113] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Terminal workflow actions">
                {([1, 2, 3] as const).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleSelectStep(step)}
                    className={`min-h-[28px] px-2 py-0.5 rounded-[3px] border text-[10px] cursor-pointer transition-colors ${
                      activeStep === step
                        ? "bg-[#1B5FED] text-white border-[#1B5FED] font-semibold"
                        : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white"
                    }`}
                  >
                    Step {step}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleVerifyLive}
                  disabled={isCheckingLive}
                  className="min-h-[28px] px-2 py-0.5 rounded-[3px] border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <Play className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                  <span>{isCheckingLive ? "Checking..." : "Verify Live"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCommand}
                  className="min-h-[28px] px-2 py-0.5 rounded-[3px] border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd ? (
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

              <span className="text-emerald-400 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
