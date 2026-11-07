"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

interface FeatureRow {
  name: string;
  starter: string | boolean;
  enterprise: string | boolean;
}

interface FeatureGroup {
  category: string;
  rows: FeatureRow[];
}

const FEATURE_MATRIX: FeatureGroup[] = [
  {
    category: "Registry & Workspaces",
    rows: [
      { name: "Public skill installs & search", starter: "Unlimited", enterprise: "Unlimited" },
      { name: "Public skill publishing", starter: "Unlimited", enterprise: "Unlimited" },
      { name: "Private registry namespaces", starter: false, enterprise: "Unlimited" },
      { name: "Local offline CLI cache", starter: true, enterprise: true },
      { name: "Cross-agent MCP bindings", starter: "Standard", enterprise: "Priority" },
    ],
  },
  {
    category: "Security & Governance",
    rows: [
      { name: "Fine-grained team RBAC", starter: false, enterprise: true },
      { name: "SOC 2 Type II audit logging", starter: false, enterprise: true },
      { name: "Self-hosted air-gapped registry", starter: false, enterprise: true },
      { name: "Vulnerability & dependency scanning", starter: "Basic", enterprise: "Automated / Real-time" },
    ],
  },
  {
    category: "Support & Engineering SLA",
    rows: [
      { name: "Community Discord & GitHub Discussions", starter: true, enterprise: true },
      { name: "Dedicated on-call engineering SLA", starter: false, enterprise: "4 Hours" },
      { name: "Custom migration & setup assistance", starter: false, enterprise: true },
      { name: "Uptime guarantee", starter: "Best-effort", enterprise: "99.99%" },
    ],
  },
];

export const FeatureTable = () => {
  const renderVal = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="inline-flex items-center justify-center rounded-full bg-[#1A5FED]/10 p-1 shrink-0">
          <Check className="h-4 w-4 text-[#1A5FED] stroke-[3px]" />
        </div>
      ) : (
        <Minus className="h-4 w-4 text-black/25 mx-auto" />
      );
    }

    const isSpecialValue = ["Unlimited", "Automated / Real-time", "4 Hours", "99.99%"].includes(val);

    return (
      <span
        className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-[3px] border leading-none font-mono ${
          isSpecialValue
            ? "bg-[#1A5FED]/10 text-[#1A5FED] border-[#1A5FED]/20"
            : "bg-black/5 text-black/80 border-black/10"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header text */}
      <div className="text-center mb-12">
        <h2
          className="font-instrument-serif text-3xl sm:text-5xl italic text-black font-normal tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Compare Capabilities
        </h2>
        <p className="mt-2 text-sm sm:text-base text-black/60 font-sans">
          Everything you need for individual hacking and production fleet scaling.
        </p>
      </div>

      {/* Sleek, Premium Table Container Card */}
      <div className="bg-white border border-black/10 rounded-[8px] shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#F7F7F7]">
                <th className="py-4 px-6 text-xs font-semibold text-black/70 w-1/2 uppercase tracking-wider font-mono">
                  [CAPABILITY]
                </th>
                <th className="py-4 px-4 text-center text-xs font-semibold text-black/70 w-1/4 uppercase tracking-wider font-mono">
                  FOR DEVELOPERS ($0)
                </th>
                <th className="py-4 px-4 text-center text-xs font-bold text-[#1A5FED] w-1/4 bg-[#1A5FED]/[0.03] uppercase tracking-wider font-mono">
                  FOR ENTERPRISE ($15)
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  {/* Category Row header */}
                  <tr className="bg-black/[0.02] border-y border-black/5">
                    <td
                      colSpan={3}
                      className="py-3 px-6 text-[11px] font-bold text-black/50 uppercase tracking-widest font-mono"
                    >
                      {group.category}
                    </td>
                  </tr>

                  {/* Items rows */}
                  {group.rows.map((row, rowIdx) => {
                    const isLastRow =
                      groupIdx === FEATURE_MATRIX.length - 1 &&
                      rowIdx === group.rows.length - 1;
                    return (
                      <tr
                        key={rowIdx}
                        className={`${
                          isLastRow ? "" : "border-b border-black/5"
                        } hover:bg-[#F7F7F7] transition-colors`}
                      >
                        <td className="py-3.5 px-6 text-sm font-medium text-black/90 font-sans">
                          {row.name}
                        </td>
                        <td className="py-3.5 px-4 text-center align-middle">
                          {renderVal(row.starter)}
                        </td>
                        <td className="py-3.5 px-4 text-center align-middle bg-[#1A5FED]/[0.01]">
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
