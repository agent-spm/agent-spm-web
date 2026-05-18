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
    <div className="flex flex-col items-center justify-center gap-5 mb-16">
      {/* Neo-Brutalist High-Contrast Toggle Container */}
      <div className="relative flex items-center p-1 bg-[#E8E9ED] rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] w-[260px]">
        {/* Sliding Pill Indicator */}
        <div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-[#1B5FED] border-2 border-black transition-all duration-300 ease-out"
          style={{
            left: isMonthly ? "2px" : "calc(50% + 1px)",
            width: "calc(50% - 3px)",
            height: "calc(100% - 4px)",
          }}
        />

        {/* Monthly Switch */}
        <button
          type="button"
          onClick={() => setBillingInterval("monthly")}
          className={`relative z-10 w-1/2 py-2 text-sm font-mono font-bold uppercase select-none transition-colors duration-200 cursor-pointer ${
            isMonthly ? "text-white" : "text-black hover:text-[#1B5FED]"
          }`}
        >
          Monthly
        </button>

        {/* Yearly Switch */}
        <button
          type="button"
          onClick={() => setBillingInterval("yearly")}
          className={`relative z-10 w-1/2 py-2 text-sm font-mono font-bold uppercase select-none transition-colors duration-200 cursor-pointer ${
            !isMonthly ? "text-white" : "text-black hover:text-[#1B5FED]"
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Save 17% Tag - Stylized Badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-black border-2 border-black px-4 py-1.5 text-xs font-mono font-bold tracking-wide uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-pulse">
        <span className="h-2 w-2 rounded-full bg-[#1B5FED]" />
        Save 17% with Yearly Billing
      </span>
    </div>
  );
};
