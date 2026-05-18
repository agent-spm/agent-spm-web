"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

interface FeatureRow {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

interface FeatureGroup {
  category: string;
  rows: FeatureRow[];
}

const FEATURE_MATRIX: FeatureGroup[] = [
  {
    category: "Packages & Namespace",
    rows: [
      { name: "Public package installs", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Public packages published", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Private packages", starter: false, pro: "25", enterprise: "Unlimited" },
      { name: "Private namespaces", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "API & Integrations",
    rows: [
      { name: "API rate limit", starter: "100/hr", pro: "5,000/hr", enterprise: "Unlimited" },
      { name: "Webhooks", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Administration & Security",
    rows: [
      { name: "Team members", starter: "1", pro: "5", enterprise: "Unlimited" },
      { name: "SSO / SAML", starter: false, pro: false, enterprise: true },
      { name: "Self-hosted registry", starter: false, pro: false, enterprise: true },
      { name: "Audit logs", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support & SLA",
    rows: [
      { name: "Package analytics", starter: "Basic", pro: "Advanced", enterprise: "Advanced + Custom" },
      { name: "Support", starter: "Community", pro: "Email (48h)", enterprise: "Dedicated (4h)" },
      { name: "SLA", starter: false, pro: false, enterprise: "99.9%" },
    ],
  },
];

export const FeatureTable = () => {
  const renderVal = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="inline-flex items-center justify-center rounded-full bg-[#1B5FED]/10 border-2 border-black p-1 shadow-[1px_1px_0px_#000000]">
          <Check className="h-4 w-4 text-[#1B5FED] stroke-[3px]" />
        </div>
      ) : (
        <Minus className="h-4 w-4 text-zinc-400 mx-auto" />
      );
    }

    const isSpecialValue = ["Unlimited", "Advanced", "Dedicated (4h)", "99.9%"].includes(val);

    return (
      <span
        className={`inline-flex items-center justify-center text-xs font-mono font-bold px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] leading-none ${
          isSpecialValue
            ? "bg-[#1B5FED] text-white"
            : "bg-white text-black"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="w-full mt-24">
      {/* Header text */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          Compare Features
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-600">
          Find the perfect limits and guarantees for your agent fleet.
        </p>
      </div>

      {/* High-Contrast Neo-Brutalist Table Container Card */}
      <div className="bg-white border-2 border-black rounded-3xl shadow-[4px_4px_0px_#000000] overflow-hidden">
        {/* Horizontal Scroll Wrapper */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-400">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-6 px-6 text-sm font-bold text-black w-2/5 uppercase tracking-wider font-mono">
                  Features
                </th>
                <th className="py-6 px-4 text-center text-sm font-bold text-black w-1/5 uppercase tracking-wider font-mono">
                  Starter
                </th>
                <th className="py-6 px-4 text-center text-sm font-bold text-[#1B5FED] w-1/5 bg-[#1B5FED]/5 uppercase tracking-wider font-mono border-x-2 border-black">
                  Pro
                </th>
                <th className="py-6 px-6 text-center text-sm font-bold text-black w-1/5 uppercase tracking-wider font-mono">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  {/* Category Row header */}
                  <tr className="bg-[#E8E9ED] border-b-2 border-black">
                    <td
                      colSpan={4}
                      className="py-4 px-6 text-xs font-bold text-black uppercase tracking-widest font-mono border-r-0"
                    >
                      {group.category}
                    </td>
                  </tr>

                  {/* Items rows */}
                  {group.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-zinc-200 hover:bg-[#E8E9ED]/30 transition-colors"
                    >
                      <td className="py-4.5 px-6 text-sm font-bold text-black">
                        {row.name}
                      </td>
                      <td className="py-4.5 px-4 text-center align-middle">
                        {renderVal(row.starter)}
                      </td>
                      <td className="py-4.5 px-4 text-center align-middle bg-[#1B5FED]/3 border-x-2 border-black">
                        {renderVal(row.pro)}
                      </td>
                      <td className="py-4.5 px-6 text-center align-middle">
                        {renderVal(row.enterprise)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
