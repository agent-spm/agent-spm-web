"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Flag,
  Plus,
  RefreshCw,
  AlertTriangle,
  Sliders,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface AdminFlagRow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  target: string;
}

export default function AdminFeatureFlagsPage() {
  const { refreshSession } = useSession();
  const { showToast } = useToast();

  const [flags, setFlags] = useState<AdminFlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create Modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTarget, setNewTarget] = useState("All");
  const [newRollout, setNewRollout] = useState(100);
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [editingFlag, setEditingFlag] = useState<AdminFlagRow | null>(null);
  const [editRollout, setEditRollout] = useState(100);
  const [editTarget, setEditTarget] = useState("All");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load feature flags.");
      }
      setFlags(Array.isArray(data.flags) ? data.flags : []);
      setMigrationRequired(Boolean(data.migrationRequired));
      setWarning(data.warning || null);
    } catch (err: unknown) {
      showToast({
        title: "Flags Load Failed",
        message: err instanceof Error ? err.message : "Could not load feature flags.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleToggle = async (flag: AdminFlagRow) => {
    setBusyId(flag.id);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flag.id, enabled: !flag.enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle feature flag.");
      }
      showToast({
        title: `${flag.name} ${!flag.enabled ? "Enabled" : "Disabled"}`,
        message: "Persisted to PostgreSQL runtime flags.",
        type: "success",
      });
      await Promise.all([loadFlags(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Toggle Failed",
        message: err instanceof Error ? err.message : "Could not update flag.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim().toLowerCase().replace(/\s+/g, "_"),
          description: newDesc.trim() || "Dynamic runtime capability gate.",
          enabled: true,
          rolloutPercent: newRollout,
          target: newTarget,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create feature flag.");
      }
      showToast({
        title: "Feature Flag Created",
        message: `${data.flag.name} added at ${newRollout}% rollout.`,
        type: "success",
      });
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      setNewTarget("All");
      setNewRollout(100);
      await Promise.all([loadFlags(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Create Failed",
        message: err instanceof Error ? err.message : "Could not create feature flag.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingFlag.id,
          rolloutPercent: editRollout,
          target: editTarget,
          description: editDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save feature flag.");
      }
      showToast({
        title: "Rollout Updated",
        message: `${editingFlag.name} configured for ${editTarget} (${editRollout}%).`,
        type: "success",
      });
      setEditingFlag(null);
      await Promise.all([loadFlags(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Save Failed",
        message: err instanceof Error ? err.message : "Could not save rollout rule.",
        type: "error",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            Platform Feature Flags
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Control progressive capability rollouts and tenant workspace gates backed by Supabase PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadFlags}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B5FED] hover:bg-[#154EC9] text-white font-mono text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Flag</span>
          </button>
        </div>
      </div>

      {migrationRequired && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-mono text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Database Migration Required for Persistent Feature Flags</div>
            <p className="mt-1 text-amber-900/80">
              Execute{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200">
                supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql
              </code>{" "}
              in Supabase SQL Editor to create <code className="font-semibold">public.feature_flags</code> and seed default gates.
              {warning ? ` (${warning})` : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── FLAGS LIST ── */}
      <div className="grid grid-cols-1 gap-3.5">
        {loading && flags.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center font-mono text-xs text-black/45">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
            Loading feature flags...
          </div>
        ) : flags.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-10 text-center font-mono text-xs text-black/50">
            No persistent feature flags defined yet.
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className="rounded-xl border border-black/10 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/20 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Flag className="w-4 h-4 text-[#1B5FED]" />
                  <span className="font-mono font-bold text-sm text-black">{flag.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      flag.enabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-black/[0.05] text-black/55 border border-black/10"
                    }`}
                  >
                    {flag.enabled && <CheckCircle2 className="w-3 h-3" />}
                    {flag.enabled ? "Enabled" : "Off"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1B5FED]/10 text-[#1B5FED]">
                    Target: {flag.target}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/[0.04] text-black/70">
                    Rollout: {flag.rolloutPercent}%
                  </span>
                </div>
                <p className="font-sans text-xs text-black/65">{flag.description}</p>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFlag(flag);
                    setEditRollout(flag.rolloutPercent);
                    setEditTarget(flag.target);
                    setEditDesc(flag.description);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/15 hover:border-[#1B5FED]/50 hover:text-[#1B5FED] font-mono text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>

                <button
                  type="button"
                  disabled={busyId === flag.id}
                  onClick={() => handleToggle(flag)}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 ${
                    flag.enabled
                      ? "bg-black text-white hover:bg-black/85"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {busyId === flag.id ? "..." : flag.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── CREATE FLAG MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <h2 className="font-sans font-bold text-base text-black">Create Feature Flag</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Flag Key (snake_case)
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="dag_studio_v2"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Controls multi-agent DAG orchestrator access"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-sans text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Target Cohort
                  </label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black bg-white focus:outline-none focus:border-[#1B5FED]"
                  >
                    <option value="All">All</option>
                    <option value="Pro & Enterprise">Pro & Enterprise</option>
                    <option value="Enterprise Only">Enterprise Only</option>
                    <option value="Staff Only">Staff Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Rollout (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newRollout}
                    onChange={(e) => setNewRollout(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Flag</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ROLLOUT MODAL ── */}
      {editingFlag && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <div>
                <h2 className="font-sans font-bold text-base text-black">Configure Feature Flag</h2>
                <p className="font-mono text-[11px] text-black/55">{editingFlag.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingFlag(null)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-sans text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Target Cohort
                  </label>
                  <select
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black bg-white focus:outline-none focus:border-[#1B5FED]"
                  >
                    <option value="All">All</option>
                    <option value="Pro & Enterprise">Pro & Enterprise</option>
                    <option value="Enterprise Only">Enterprise Only</option>
                    <option value="Staff Only">Staff Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Rollout ({editRollout}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editRollout}
                    onChange={(e) => setEditRollout(Number(e.target.value))}
                    className="w-full accent-[#1B5FED] mt-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingFlag(null)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
