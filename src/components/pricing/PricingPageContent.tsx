"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FeatureTable } from "./FeatureTable";
import { PricingFAQ } from "./PricingFAQ";
import { PixelDissolve } from "@/components/landing/PixelDissolve";

export const PricingPageContent = () => {
  const [tier, setTier] = useState<"developers" | "enterprise">("enterprise");

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans">
      {/* ─── Hero Section with Cyan-Blue Gradient & Liquid Glass Card ─── */}
      <section className="relative w-full overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0080FF] via-[#78D2FF] to-white text-white">
        {/* Top Pixel Dissolve */}
        <div className="absolute inset-x-0 top-0 w-full pointer-events-none select-none opacity-40 z-0">
          <PixelDissolve cellSize={24} height={160} seed={33} mode="faint-pattern" />
        </div>

        <div className="relative max-w-[1200px] mx-auto flex flex-col items-center z-10">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-white">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIFETIME ENTERPRISE ACCESS
          </div>

          {/* Headline */}
          <div className="text-center max-w-2xl mb-12 sm:mb-16">
            <h1
              className="font-instrument-serif text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] text-white font-normal italic tracking-tight mb-4 select-none"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              One price. for Enterprise.
            </h1>
            <p className="font-sans text-base sm:text-xl text-white/95 font-medium leading-relaxed max-w-lg mx-auto">
              One-time payment. No subscription. Get the access that is easy to
              handle.
            </p>
          </div>

          {/* 4-Layer Liquid Glass Pricing Card */}
          <div className="glass-card-shell relative w-full max-w-[420px] min-h-[580px] rounded-[8px] border border-black/10 shadow-2xl text-black flex flex-col justify-between transition-transform hover:scale-[1.01]">
            {/* Layer 0: Liquid Distortion Filter */}
            <div className="glass-card-filter pointer-events-none" aria-hidden="true" />

            {/* Layer 1: Translucent Glass Overlay */}
            <div className="glass-card-overlay bg-[#F7F7F7]/85 backdrop-blur-md pointer-events-none" aria-hidden="true" />

            {/* Layer 2: Specular Rim Highlight */}
            <div className="glass-card-specular pointer-events-none" aria-hidden="true" />

            {/* Layer 3: Crisp Foreground Content */}
            <div className="glass-card-content relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full min-h-[580px]">
              <div>
                {/* Segmented Toggle */}
                <div className="w-full h-[44px] bg-white rounded-[4px] p-1 flex items-center justify-between border border-black/5 shadow-inner mb-6">
                  <button
                    type="button"
                    onClick={() => setTier("developers")}
                    className={`flex-1 h-full rounded-[2px] font-sans text-sm font-medium transition-all cursor-pointer ${
                      tier === "developers"
                        ? "bg-black text-white shadow-sm"
                        : "text-black/60 hover:text-black"
                    }`}
                  >
                    For developers
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier("enterprise")}
                    className={`flex-1 h-full rounded-[2px] font-sans text-sm font-semibold transition-all cursor-pointer ${
                      tier === "enterprise"
                        ? "bg-black text-white shadow-sm"
                        : "text-black/60 hover:text-black"
                    }`}
                  >
                    For Enterprise
                  </button>
                </div>

                {/* Price Header */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-sans text-5xl sm:text-6xl font-bold tracking-tight text-black">
                      {tier === "enterprise" ? "$15" : "$0"}
                    </span>
                    {tier === "enterprise" && (
                      <span className="font-sans text-2xl text-black/40 line-through">
                        $20
                      </span>
                    )}
                    <span className="font-mono text-xs uppercase tracking-wider text-black/50">
                      {tier === "enterprise" ? "One-time" : "Free forever"}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-black/60 leading-relaxed">
                    {tier === "enterprise"
                      ? "Full team access, private registry, audit logging & enterprise MCP support."
                      : "Individual open source developers & hobbyists with local workspaces."}
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8 font-sans text-sm text-black/85">
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#1A5FED] font-bold text-base">✔</span>
                    <span>Unlimited workspaces &amp; skills</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#1A5FED] font-bold text-base">✔</span>
                    <span>Cross-agent interoperability engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#1A5FED] font-bold text-base">✔</span>
                    <span>
                      {tier === "enterprise"
                        ? "Private registry with fine-grained RBAC"
                        : "Public skills registry & discovery"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#1A5FED] font-bold text-base">✔</span>
                    <span>
                      {tier === "enterprise"
                        ? "Dedicated 24/7 on-call engineering SLA"
                        : "Community Discord & GitHub support"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#1A5FED] font-bold text-base">✔</span>
                    <span>
                      {tier === "enterprise"
                        ? "SOC 2 Type II compliance & audit reports"
                        : "Standard open-source telemetry"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* CTA Button & Checkout Notes */}
              <div>
                <a
                  href={
                    tier === "enterprise"
                      ? "https://buy.polar.sh/spm-enterprise"
                      : "/search"
                  }
                  target={tier === "enterprise" ? "_blank" : undefined}
                  rel={tier === "enterprise" ? "noopener noreferrer" : undefined}
                  className="w-full block text-center py-3.5 px-4 rounded-[4px] bg-black text-white font-sans text-sm font-semibold hover:bg-black/90 active:scale-[0.99] transition-all shadow-md"
                >
                  {tier === "enterprise"
                    ? "Claim Enterprise Access — $15"
                    : "Start Building — Free"}
                </a>
                <p className="font-sans text-[11px] text-center text-black/45 mt-3">
                  Powered by Polar.sh • Instant license key delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Detailed Feature Comparison Matrix ─── */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FeatureTable />
      </section>

      {/* ─── Pricing FAQ ─── */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <PricingFAQ />
      </section>
    </div>
  );
};
