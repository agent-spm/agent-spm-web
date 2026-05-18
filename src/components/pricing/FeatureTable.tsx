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
        <div className="inline-flex items-center justify-center rounded-full bg-brand-blue/10 p-1 shrink-0">
          <Check className="h-4 w-4 text-brand-blue stroke-[3px]" />
        </div>
      ) : (
        <Minus className="h-4 w-4 text-surface-300 dark:text-surface-600 mx-auto" />
      );
    }

    const isSpecialValue = ["Unlimited", "Advanced", "Dedicated (4h)", "99.9%"].includes(val);

    return (
      <span
        className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-md border leading-none ${
          isSpecialValue
            ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
            : "bg-surface-50 text-surface-700 border-surface-200 dark:bg-surface-900 dark:text-surface-300 dark:border-surface-800"
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
        <h2 className="text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
          Compare Features
        </h2>
        <p className="mt-3 text-sm sm:text-base text-surface-500 dark:text-surface-400">
          Find the perfect limits and guarantees for your agent fleet.
        </p>
      </div>

      {/* Sleek, Premium Table Container Card */}
      <div className="bg-surface-0 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Horizontal Scroll Wrapper */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-400">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="py-6 px-6 text-sm font-semibold text-surface-900 dark:text-surface-100 w-2/5 uppercase tracking-wider font-mono">
                  Features
                </th>
                <th className="py-6 px-4 text-center text-sm font-semibold text-surface-900 dark:text-surface-100 w-1/5 uppercase tracking-wider font-mono">
                  Starter
                </th>
                <th className="py-6 px-4 text-center text-sm font-bold text-brand-blue w-1/5 bg-brand-blue/[0.02] uppercase tracking-wider font-mono">
                  Pro
                </th>
                <th className="py-6 px-6 text-center text-sm font-semibold text-surface-900 dark:text-surface-100 w-1/5 uppercase tracking-wider font-mono">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  {/* Category Row header */}
                  <tr className="bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800">
                    <td
                      colSpan={4}
                      className="py-4 px-6 text-xs font-bold text-surface-550 dark:text-surface-400 uppercase tracking-widest font-mono border-r-0"
                    >
                      {group.category}
                    </td>
                  </tr>

                  {/* Items rows */}
                  {group.rows.map((row, rowIdx) => {
                    const isLastRow = groupIdx === FEATURE_MATRIX.length - 1 && rowIdx === group.rows.length - 1;
                    return (
                      <tr
                        key={rowIdx}
                        className={`${isLastRow ? "" : "border-b border-surface-100 dark:border-surface-800"} hover:bg-surface-50/40 dark:hover:bg-surface-900/20 transition-colors`}
                      >
                        <td className="py-4 px-6 text-sm font-semibold text-surface-900 dark:text-surface-100">
                          {row.name}
                        </td>
                        <td className="py-4 px-4 text-center align-middle">
                          {renderVal(row.starter)}
                        </td>
                        <td className="py-4 px-4 text-center align-middle bg-brand-blue/[0.01]">
                          {renderVal(row.pro)}
                        </td>
                        <td className="py-4 px-6 text-center align-middle">
                          {renderVal(row.enterprise)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

