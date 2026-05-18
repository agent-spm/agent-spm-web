"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

export const PricingCard = ({
  name,
  price,
  period,
  tagline,
  features,
  ctaText,
  ctaHref,
  popular = false,
}: PricingCardProps) => {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-3xl p-8 bg-white border-2 border-black transition-all duration-200 ${
        popular
          ? "shadow-[6px_6px_0px_#1B5FED] hover:shadow-[10px_10px_0px_#1B5FED] hover:translate-x-[-2px] hover:translate-y-[-2px] scale-100 md:scale-[1.03] z-10"
          : "shadow-[4px_4px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#1B5FED] text-white border-2 border-black px-4 py-1 text-[10px] font-bold font-mono uppercase tracking-wider shadow-[2px_2px_0px_#000000] animate-pulse">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      <div>
        {/* Tier Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-black uppercase tracking-tight font-mono">
            {name}
          </h3>
          <p className="mt-2.5 text-sm text-zinc-600 min-h-[40px] leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Pricing block */}
        <div className="flex items-baseline gap-1.5 mb-8">
          <span className="text-5xl font-extrabold tracking-tight text-black transition-all duration-300">
            {price}
          </span>
          <span className="text-sm font-mono font-bold text-zinc-500 uppercase">
            {period}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-0.5 bg-black mb-8" />

        {/* Features Checklist */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-black font-medium">
              <div className="flex items-center justify-center rounded-full bg-[#1B5FED]/10 border border-[#1B5FED]/30 p-0.5 mt-0.5 shrink-0">
                <Check className="h-3.5 w-3.5 text-[#1B5FED] stroke-[3px]" />
              </div>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <Link
        href={ctaHref}
        className={`group flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 px-4 text-center text-sm font-bold font-mono transition-all duration-200 active:scale-[0.98] border-2 border-black cursor-pointer ${
          popular
            ? "bg-[#1B5FED] text-white hover:bg-[#1B5FED]/90 shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000]"
            : "bg-white text-black hover:bg-[#E8E9ED] shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000]"
        }`}
      >
        <span>{ctaText}</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
      </Link>
    </div>
  );
};
