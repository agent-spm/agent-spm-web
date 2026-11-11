"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import { Flag, Plus, Check, Edit, Sliders } from "lucide-react";

export default function FeatureFlagsPage() {
  const { featureFlags, toggleFeatureFlag } = useSession();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Feature Flags &amp; Canary Rollouts</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Control progressive delivery and runtime feature gates across org tiers</p>
        </div>

        <button
          onClick={() => alert("New Feature Flag creator opened.")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs uppercase font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Flag</span>
        </button>
      </div>

      {/* Feature Flags Table */}
      <div className="rounded-[8px] border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAFA] uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Flag Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-6">Rollout Percentage</th>
                <th className="py-3 px-4">Target Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {featureFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-[#F0F7FF] transition-colors">
                  <td className="py-4 px-6 font-bold text-black whitespace-nowrap">
                    <span className="text-[#1B5FED] font-mono">{flag.name}</span>
                  </td>

                  <td className="py-4 px-4 text-black/70 max-w-sm font-sans text-xs">
                    {flag.description}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatureFlag(flag.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        flag.enabled
                          ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                          : "bg-black/5 text-black/50 border border-black/10"
                      }`}
                    >
                      {flag.enabled ? "ON" : "OFF"}
                    </button>
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap min-w-44">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-black/50">
                        <span>Canary</span>
                        <span className="text-black font-bold">{flag.rolloutPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                        <div
                          style={{ width: `${flag.rolloutPercent}%` }}
                          className={`h-full rounded-full ${flag.enabled ? "bg-[#1B5FED]" : "bg-black/30"}`}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/5 text-black/70 border border-black/10">
                      {flag.target}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Configured rollout targets for ${flag.name}`)}
                      className="p-1.5 rounded-[4px] text-black/40 hover:text-black hover:bg-black/5 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
