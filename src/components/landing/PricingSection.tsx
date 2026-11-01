"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PixelBox } from "./PixelBox";

export const PricingSection = () => {
  const [tier, setTier] = useState<"developers" | "enterprise">("enterprise");

  return (
    <section
      className="relative w-full overflow-hidden pt-0 pb-0 text-black"
      style={{
        background:
          "linear-gradient(180deg, #BAE6FD 0%, #7ECEFF 18%, #42B5FF 38%, #1890FF 58%, #0080FF 72%, #7ECEFF 88%, #BAE6FD 96%, #FFFFFF 100%)",
      }}
    >
      {/* ─── Top White Pixel Dither: Exact same auto-scroll animation & 42-col cell size as Hero & Footer ─── */}
      <div className="relative w-full z-10 pointer-events-none select-none mb-10 sm:mb-14">
        <PixelBox variant="pricing-dissolve" color="#ffffff" className="w-full" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center z-10">
        {/* ─── Headline & Subcopy (Exact match to Reference Image 4: Black, Sans-serif, Upright) ─── */}
        <div className="text-center max-w-2xl mb-12 sm:mb-16">
          <h2 className="font-sans text-4xl sm:text-5xl lg:text-[56px] font-bold text-black tracking-tight leading-[1.08] mb-4 select-none">
            One price.
            <br />
            for Enterprise.
          </h2>
          <p className="font-sans text-base sm:text-lg text-black/75 font-medium leading-relaxed max-w-lg mx-auto">
            One-time payment. No subscription.
            <br className="hidden sm:inline" />
            Get the access that is easy to handle.
          </p>
        </div>

        {/* ─── Pricing Card (Crisp Pure White Container with Minimal Clean Shadow) ─── */}
        <div className="relative w-full max-w-[400px] min-h-[574px] bg-white rounded-[8px] border border-black/10 shadow-2xl text-black flex flex-col justify-between p-6 sm:p-8 transition-transform hover:scale-[1.01] z-10">
          <div>
            {/* Segmented Toggle (Figma 320x39, r=4) */}
            <div className="w-full h-[44px] bg-[#F5F5F5] rounded-[6px] p-1 flex items-center justify-between border border-black/5 mb-6">
              <button
                type="button"
                onClick={() => setTier("developers")}
                className={`flex-1 h-full rounded-[4px] font-sans text-sm font-medium transition-all ${
                  tier === "developers"
                    ? "bg-black text-white shadow-sm font-semibold"
                    : "text-black/60 hover:text-black"
                }`}
              >
                For developers
              </button>
              <button
                type="button"
                onClick={() => setTier("enterprise")}
                className={`flex-1 h-full rounded-[4px] font-sans text-sm transition-all ${
                  tier === "enterprise"
                    ? "bg-black text-white shadow-sm font-semibold"
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
                  <span className="font-sans text-2xl text-black/35 line-through font-normal">
                    $20
                  </span>
                )}
                <span className="font-mono text-xs uppercase tracking-wider text-black/50 ml-auto">
                  {tier === "enterprise" ? "One-time" : "Free forever"}
                </span>
              </div>
              <p className="font-sans text-sm text-black/65 leading-relaxed">
                {tier === "enterprise"
                  ? "Full team access, private registry, audit logging & enterprise MCP support."
                  : "Individual open source developers & hobbyists with local workspaces."}
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-3.5 mb-8 font-sans text-sm text-black/85">
              <li className="flex items-center gap-2.5">
                <span className="text-[#0080FF] font-bold text-base">✔</span>
                <span>Unlimited workspaces &amp; skills</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#0080FF] font-bold text-base">✔</span>
                <span>Model Context Protocol (MCP) native</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#0080FF] font-bold text-base">✔</span>
                <span>
                  {tier === "enterprise"
                    ? "Shared team credentials & RBAC"
                    : "Local credential encryption"}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#0080FF] font-bold text-base">✔</span>
                <span>
                  {tier === "enterprise"
                    ? "Dedicated Slack / Discord channel"
                    : "Community GitHub discussions"}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#0080FF] font-bold text-base">✔</span>
                <span>Commercial lifetime licence</span>
              </li>
            </ul>
          </div>

          <div>
            {/* Solid Black Action Button */}
            <Link
              href="/checkout"
              className="w-full h-[48px] rounded-[6px] bg-black text-white font-sans text-base font-semibold flex items-center justify-center shadow-lg hover:bg-neutral-800 transition-all active:scale-98 mb-4"
            >
              <span>{tier === "enterprise" ? "Buy License" : "Download Free"}</span>
              <span className="ml-2 font-mono text-sm">→</span>
            </Link>

            {/* Micro guarantees */}
            <p className="font-sans text-xs text-center text-black/45">
              Instant license key • 14-day money-back guarantee
            </p>
          </div>
        </div>

        {/* ─── Footnote (Figma node 328:2331) ─── */}
        <p className="font-sans text-xs sm:text-sm text-center text-black/60 font-medium max-w-[682px] mt-8 mb-4 relative z-10">
          Secure checkout by Polar.sh, powered by Stripe. Prices are in USD,
          excluding VAT and may vary by location.
        </p>
      </div>

      {/* ─── Bottom White Pixel Dither: Exact same auto-scroll animation & 42-col cell size as Hero & Footer ─── */}
      <div className="relative w-full z-10 pointer-events-none select-none mt-10 sm:mt-14">
        <PixelBox variant="pricing-bottom-dissolve" color="#ffffff" className="w-full" />
      </div>
    </section>
  );
};
