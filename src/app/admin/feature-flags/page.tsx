"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import { Flag, Plus, Check, Edit, Sliders, X, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function FeatureFlagsPage() {
  const { featureFlags, toggleFeatureFlag } = useSession();
  const { showToast } = useToast();

  const [localFlags, setLocalFlags] = useState(featureFlags);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFlag, setEditFlag] = useState<typeof featureFlags[0] | null>(null);

  // Form states
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [newFlagRollout, setNewFlagRollout] = useState(10);
  const [newFlagTarget, setNewFlagTarget] = useState<typeof featureFlags[0]["target"]>("Pro and above");

  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName.trim()) return;

    const newF = {
      id: `ff_${Date.now()}`,
      name: newFlagName.trim(),
      description: newFlagDesc.trim() || "Dynamic runtime feature gate.",
      enabled: true,
      rolloutPercent: Number(newFlagRollout),
      target: newFlagTarget,
    };

    setLocalFlags([newF, ...localFlags]);
    setShowCreateModal(false);
    showToast({
      title: "Feature Flag Created",
      message: `Flag "${newFlagName}" initialized at ${newFlagRollout}% rollout.`,
      type: "success",
    });
  };

  const handleUpdateEditFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFlag) return;

    setLocalFlags((prev) =>
      prev.map((f) => (f.id === editFlag.id ? editFlag : f))
    );
    showToast({
      title: "Rollout Adjusted",
      message: `${editFlag.name} set to ${editFlag.rolloutPercent}% canary deployment.`,
      type: "success",
    });
    setEditFlag(null);
  };

  const handleToggle = (id: string) => {
    setLocalFlags((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const next = !f.enabled;
          showToast({
            title: next ? `${f.name} Enabled` : `${f.name} Disabled`,
            message: next ? "Canary rollout gate active." : "Feature completely silenced.",
            type: next ? "success" : "info",
          });
          return { ...f, enabled: next };
        }
        return f;
      })
    );
    toggleFeatureFlag(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Feature Flags &amp; Canary Rollouts</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Control progressive delivery and runtime feature gates across org tiers</p>
        </div>

        <button
          onClick={() => {
            setNewFlagName("");
            setNewFlagDesc("");
            setNewFlagRollout(10);
            setShowCreateModal(true);
          }}
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
              {localFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-[#F0F7FF] transition-colors">
                  <td className="py-4 px-6 font-bold text-black whitespace-nowrap">
                    <span className="text-[#1B5FED] font-mono">{flag.name}</span>
                  </td>

                  <td className="py-4 px-4 text-black/70 max-w-sm font-sans text-xs">
                    {flag.description}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(flag.id)}
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
                      onClick={() => setEditFlag(flag)}
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

      {/* ── MODAL: CREATE FEATURE FLAG ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">New Feature Gate</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFlag} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Flag Key (snake_case)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. streaming_tarball_ingest"
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Purpose & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What does this gate unlock for agents or users?"
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs font-sans text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  <span>Initial Rollout</span>
                  <span className="text-[#1B5FED] font-bold">{newFlagRollout}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newFlagRollout}
                  onChange={(e) => setNewFlagRollout(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#1B5FED]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Target Tier
                </label>
                <select
                  value={newFlagTarget}
                  onChange={(e) => setNewFlagTarget(e.target.value as typeof featureFlags[0]["target"])}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="Pro and above">Pro and above</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="All">All Users</option>
                  <option value="Beta orgs">Beta orgs</option>
                  <option value="Off">Off</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold shadow-md cursor-pointer"
                >
                  Create Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT FEATURE FLAG ROLLOUT ── */}
      {editFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">Configure {editFlag.name}</h3>
              </div>
              <button
                onClick={() => setEditFlag(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEditFlag} className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  <span>Canary Rollout Traffic</span>
                  <span className="text-[#1B5FED] font-bold">{editFlag.rolloutPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editFlag.rolloutPercent}
                  onChange={(e) => setEditFlag({ ...editFlag, rolloutPercent: Number(e.target.value) })}
                  className="w-full cursor-pointer accent-[#1B5FED]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Target Tier Scope
                </label>
                <select
                  value={editFlag.target}
                  onChange={(e) =>
                    setEditFlag({
                      ...editFlag,
                      target: e.target.value as typeof featureFlags[0]["target"],
                    })
                  }
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="Pro and above">Pro and above</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="All">All Users</option>
                  <option value="Beta orgs">Beta orgs</option>
                  <option value="Off">Off</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditFlag(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold shadow-md cursor-pointer"
                >
                  Save Rollout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
