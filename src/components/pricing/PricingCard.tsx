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
      className={`relative flex flex-col justify-between rounded-3xl p-8 bg-surface-0 transition-all duration-300 ${
        popular
          ? "border-2 border-brand-blue shadow-xl shadow-brand-blue/10 scale-100 md:scale-[1.03] z-10 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-brand-blue/15"
          : "border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md hover:border-surface-300 dark:hover:border-surface-700 hover:translate-y-[-4px]"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-brand-blue text-white px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-md animate-pulse">
          <Sparkles className="h-3 w-3" />
          Most Popular
        </div>
      )}

      <div>
        {/* Tier Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
            {name}
          </h3>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 min-h-[40px] leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Pricing block */}
        <div className="flex items-baseline gap-1.5 mb-8">
          <span className="text-5xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 transition-all duration-300">
            {price}
          </span>
          <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
            {period}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-surface-150 dark:bg-surface-800 mb-8" />

        {/* Features Checklist */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-400 font-medium">
              <div className="flex items-center justify-center rounded-full bg-brand-blue/10 p-0.5 mt-0.5 shrink-0">
                <Check className="h-3.5 w-3.5 text-brand-blue stroke-[3px]" />
              </div>
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <Link
        href={ctaHref}
        className={`group flex items-center justify-center gap-2 w-full rounded-xl py-3 px-4 text-center text-sm font-semibold transition-all duration-250 active:scale-[0.98] cursor-pointer ${
          popular
            ? "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/15 hover:shadow-brand-blue/30"
            : "border border-surface-200 hover:border-brand-blue/30 bg-surface-0 hover:bg-surface-50 text-surface-700 hover:text-brand-blue dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:text-white"
        }`}
      >
        <span>{ctaText}</span>
        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
      </Link>
    </div>
  );
};

