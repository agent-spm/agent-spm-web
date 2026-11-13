"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const WindowsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-1.03 2.76.99.08 2.05-.51 2.67-1.26z" />
  </svg>
);

const LinuxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.002 0c-3.14 0-5.498 2.228-5.498 5.617 0 1.91.737 3.738 1.455 5.253-.47.643-1.08 1.357-1.77 2.12-.99 1.1-2.19 2.42-2.19 4.34 0 3.42 2.72 6.67 7.99 6.67 5.28 0 8.01-3.25 8.01-6.67 0-1.92-1.2-3.24-2.19-4.34-.69-.763-1.3-1.477-1.77-2.12.72-1.515 1.45-3.343 1.45-5.253 0-3.389-2.35-5.617-5.49-5.617z" />
  </svg>
);

export const CTABlockSection = () => {
  const [activeStep, setActiveStep] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Duplicate <DistortionFilter /> removed (already rendered globally in src/app/layout.tsx) */}

      <div className="max-w-[1120px] mx-auto">
        {/* Figma Rectangle 280 (1120x438) container */}
        <div className="relative w-full min-h-[438px] bg-[#F7F7F7] rounded-[8px] border border-black/5 p-8 sm:p-12 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-lg overflow-hidden">
          {/* Left Column (Exact copy and geometry from Figma) */}
          <div className="flex-1 max-w-xl">
            {/* SPM Logo (Group 46, 30x30) + CLI for all OS */}
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/figma/spm-logo-cta.svg"
                alt="Agent SPM CLI"
                width={30}
                height={30}
                className="w-[30px] h-[30px] rounded-[2px] object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/images/figma/Group 46.png";
                }}
              />
              <span className="font-sans text-base sm:text-lg font-semibold text-black tracking-tight">
                CLI for all OS
              </span>
            </div>

            {/* Title: A Useful Agent Skills Manager (Instrument Serif, italic, 64px) */}
            <h2
              className="font-instrument-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] text-black font-normal italic tracking-tight mb-4"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              A Useful Agent Skills
              <br />
              Manager
            </h2>

            {/* Subcopy */}
            <p className="font-sans text-sm sm:text-base text-black/60 font-normal leading-relaxed mb-6 max-w-[469px]">
              Check out recent announcement, the agent skills decoded series, and
              other in-depth posts about skills package manager behind the
              curtains.
            </p>

            {/* OS Icons Row (Figma Frame 28) */}
            <div className="flex items-center gap-3 mb-8">
              <span className="font-sans text-xs sm:text-sm font-medium text-black/75">
                Your efficiency manager:
              </span>
              <div className="flex items-center gap-2.5 text-black">
                <WindowsIcon />
                <AppleIcon />
                <LinuxIcon />
              </div>
            </div>

            {/* Download Now Button (Figma Rectangle 287, 174x47, r=9) */}
            <Link
              href="/search"
              className="inline-flex items-center justify-center w-[174px] h-[47px] rounded-[9px] bg-black text-white font-sans text-base font-semibold shadow-md hover:bg-neutral-800 transition-all active:scale-98"
            >
              <span>Download Now</span>
              <span className="ml-2 font-mono text-sm">→</span>
            </Link>
          </div>

          {/* Right Column: 4-Layer VoiceOS Liquid Glass Terminal (510x358) */}
          <div className="glass-card-shell relative w-full max-w-full lg:w-[510px] h-[358px] rounded-[10px] overflow-hidden shadow-2xl flex-shrink-0">
            {/* Layer 0: SVG Liquid Distortion Filter */}
            <div
              className="glass-card-filter absolute inset-0 pointer-events-none rounded-[10px]"
              style={{
                backdropFilter: "url(#liquid-glass-dist)",
              }}
            />

            {/* Layer 1: Glass Translucency Overlay */}
            <div className="glass-card-overlay-dark absolute inset-0 bg-white/80 backdrop-blur-md rounded-[10px]" />

            {/* Layer 2: Glass Specular Rim Highlight */}
            <div
              className="glass-card-specular-dark absolute inset-0 rounded-[10px] pointer-events-none"
              style={{
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow:
                  "inset 0 1px 0 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)",
              }}
            />

            {/* Layer 3: Crisp Foreground Content */}
            <div className="glass-card-content relative z-10 w-full h-full p-6 flex flex-col justify-between">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
                </div>
                <span className="font-mono text-xs font-medium text-neutral-500">
                  agent-spm-terminal
                </span>
                <span className="font-mono text-[11px] text-[#1A5FED] font-semibold">
                  v1.0.0
                </span>
              </div>

              {/* Interactive Terminal Body with Auto-typing Loop */}
              <div className="font-mono text-xs sm:text-[13px] text-neutral-800 space-y-2.5 py-3 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="text-[#1A5FED] font-bold">~</span>
                  <span className="text-black font-medium">npx spm init my-agent</span>
                  {activeStep === 1 && (
                    <span className="w-2 h-4 bg-[#1A5FED] inline-block animate-pulse" />
                  )}
                </div>
                {activeStep >= 1 && (
                  <div className="text-[#1A5FED] font-medium pl-4 animate-in fade-in duration-200">
                    ✔ Initialized agent workspace (agent.config.json)
                  </div>
                )}

                {activeStep >= 2 && (
                  <>
                    <div className="flex items-center gap-2 text-neutral-400 animate-in fade-in duration-200">
                      <span className="text-[#1A5FED] font-bold">~</span>
                      <span className="text-black font-medium">spm install @mcp/postgres @mcp/brave-search</span>
                      {activeStep === 2 && (
                        <span className="w-2 h-4 bg-[#1A5FED] inline-block animate-pulse" />
                      )}
                    </div>
                    <div className="text-emerald-600 font-medium pl-4 animate-in fade-in duration-200">
                      ✔ Installed 2 packages (8 MCP tool endpoints active)
                    </div>
                  </>
                )}

                {activeStep >= 3 && (
                  <>
                    <div className="flex items-center gap-2 text-neutral-400 animate-in fade-in duration-200">
                      <span className="text-[#1A5FED] font-bold">~</span>
                      <span className="text-black font-medium">spm run agent</span>
                      <span className="w-2 h-4 bg-[#1A5FED] inline-block animate-pulse" />
                    </div>
                    <div className="text-neutral-800 pl-4 font-semibold animate-in fade-in duration-200 flex items-center gap-1.5">
                      <span>🚀 Autonomous agent loop running on port 3845</span>
                    </div>
                  </>
                )}
              </div>

              {/* Window Footer */}
              <div className="pt-3 border-t border-black/10 flex items-center justify-between font-mono text-[11px] text-neutral-500">
                <span>Claude • Cursor • Antigravity</span>
                <span className="text-green-600 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
