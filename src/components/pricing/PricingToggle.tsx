"use client";

import React from "react";

interface PricingToggleProps {
  billingInterval: "monthly" | "yearly";
  setBillingInterval: (val: "monthly" | "yearly") => void;
}

export const PricingToggle = ({
  billingInterval,
  setBillingInterval,
}: PricingToggleProps) => {
  const isMonthly = billingInterval === "monthly";

  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-16">
      {/* Sleek, Premium Rounded Toggle Container */}
      <div className="relative flex items-center p-1 bg-zinc-100 dark:bg-surface-900 rounded-full border border-surface-200 dark:border-surface-800 w-[240px]">
        {/* Sliding Pill Indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-brand-blue shadow-md shadow-brand-blue/20 transition-all duration-300 ease-out"
          style={{
            left: isMonthly ? "4px" : "calc(50% + 2px)",
            width: "calc(50% - 6px)",
            height: "calc(100% - 8px)",
          }}
        />

        {/* Monthly Switch */}
        <button
          type="button"
          onClick={() => setBillingInterval("monthly")}
          className={`relative z-10 w-1/2 py-2 text-xs font-semibold select-none transition-colors duration-200 cursor-pointer ${
            isMonthly ? "text-white" : "text-surface-600 hover:text-brand-blue dark:text-surface-400"
          }`}
        >
          Monthly
        </button>

        {/* Yearly Switch */}
        <button
          type="button"
          onClick={() => setBillingInterval("yearly")}
          className={`relative z-10 w-1/2 py-2 text-xs font-semibold select-none transition-colors duration-200 cursor-pointer ${
            !isMonthly ? "text-white" : "text-surface-600 hover:text-brand-blue dark:text-surface-400"
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Save 17% Tag - Stylized Sleek Badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-3.5 py-1 text-xs font-semibold tracking-wide uppercase animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
        Save 17% with Yearly Billing
      </span>
    </div>
  );
};

