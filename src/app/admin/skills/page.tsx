"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Loader2,
  X,
  TerminalSquare,
  Globe,
  Lock,
} from "lucide-react";

interface AdminSkillRow {
  id: string;
  rawName: string;
  slug: string;
  version: string;
  publisher: string;
  publisherEmail: string;
  downloads: string;
  size: string;
  verified: boolean;
  visibility: string;
  status: string;
  flags: string[];
  takedown: boolean;
}

export default function AdminSkillsRegistryPage() {
  const { showToast } = useToast();

  const [skills, setSkills] = useState<AdminSkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "review" | "quarantined" | "verified">("all");
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Quarantine reason modal
  const [quarantineTarget, setQuarantineTarget] = useState<AdminSkillRow | null>(null);
  const [quarantineReason, setQuarantineReason] = useState(
    "Policy & security hold enforced by platform superadmin."
  );

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/skills", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load skills registry.");
      }
      setSkills(Array.isArray(data.skills) ? data.skills : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load skills registry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return skills.filter((s) => {
      if (filterMode === "review") {
        const needsReview = !s.verified || s.flags.includes("Flagged") || s.takedown;
        if (!needsReview) return false;
      } else if (filterMode === "quarantined") {
        if (!s.takedown) return false;
      } else if (filterMode === "verified") {
        if (!s.verified || s.takedown) return false;
      }

      if (!q) return true;
      return (
        s.slug.toLowerCase().includes(q) ||
        s.rawName.toLowerCase().includes(q) ||
        s.publisher.toLowerCase().includes(q) ||
        s.publisherEmail.toLowerCase().includes(q)
      );
    });
  }, [skills, searchQuery, filterMode]);

  const reviewQueueCount = useMemo(
    () => skills.filter((s) => !s.verified || s.flags.includes("Flagged") || s.takedown).length,
    [skills]
  );

  const quarantinedCount = useMemo(
    () => skills.filter((s) => s.takedown).length,
    [skills]
  );

  const handleRunAstScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_ast_scan" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AST scan failed.");
      }
      showToast({
        title: "Registry Security Scan Complete",
        message: `Scanned ${data.totalScanned} package(s); ${data.flagged} unverified package(s) in review queue.`,
        type: data.flagged > 0 ? "warning" : "success",
      });
      await loadSkills();
    } catch (err: unknown) {
      showToast({
        title: "AST Scan Failed",
        message: err instanceof Error ? err.message : "Could not run security scan.",
        type: "error",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleToggleVerify = async (skill: AdminSkillRow) => {
    setBusyId(skill.id);
    try {
      const nextVerified = !skill.verified;
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_verified",
          packageId: skill.id,
          verified: nextVerified,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification update failed.");
      }
      showToast({
        title: nextVerified ? "Package Verified" : "Verification Removed",
        message: `${skill.slug} trust badge updated.`,
        type: "success",
      });
      await loadSkills();
    } catch (err: unknown) {
      showToast({
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Could not update package trust state.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleQuarantineOrRestore = async (
    skill: AdminSkillRow,
    mode: "quarantine" | "restore",
    reason?: string
  ) => {
    setBusyId(skill.id);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          packageId: skill.id,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Moderation update failed.");
      }
      showToast({
        title: mode === "quarantine" ? "Skill Quarantined" : "Skill Restored",
        message:
          mode === "quarantine"
            ? `${skill.slug} downloads and installs are now blocked.`
            : `${skill.slug} is restored to active published state.`,
        type: mode === "quarantine" ? "warning" : "success",
      });
      setQuarantineTarget(null);
      await loadSkills();
    } catch (err: unknown) {
      showToast({
        title: "Moderation Error",
        message: err instanceof Error ? err.message : "Could not update package status.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            Global Skills Registry Moderation
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Audit packages, toggle cryptographic trust verification, and enforce immediate quarantine kill-switches
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSkills}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleRunAstScan}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-black/85 text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {scanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ScanLine className="w-3.5 h-3.5" />
            )}
            <span>Run AST Scan</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER TABS ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by package @scope/name, publisher name, or email..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-black/10 bg-white font-mono text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-[#1B5FED]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: "all", label: `All (${skills.length})` },
            { id: "review", label: `Review Queue (${reviewQueueCount})` },
            { id: "verified", label: "Verified" },
            { id: "quarantined", label: `Quarantined (${quarantinedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as typeof filterMode)}
              className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors font-semibold ${
                filterMode === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-black/65 border-black/10 hover:border-black/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-mono text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── REGISTRY TABLE ── */}
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-black/10 text-black/50 uppercase bg-black/[0.02]">
              <th className="py-3.5 px-4 font-semibold">Package</th>
              <th className="py-3.5 px-4 font-semibold">Publisher</th>
              <th className="py-3.5 px-4 font-semibold">Pulls / Size</th>
              <th className="py-3.5 px-4 font-semibold">Trust & Flags</th>
              <th className="py-3.5 px-4 text-right font-semibold">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading && skills.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-black/45">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
                  Loading registry manifests...
                </td>
              </tr>
            ) : filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-black/45">
                  No skills match your active filter.
                </td>
              </tr>
            ) : (
              filteredSkills.map((skill) => (
                <tr
                  key={skill.id}
                  className={`transition-colors ${
                    skill.takedown ? "bg-red-50/40 hover:bg-red-50/70" : "hover:bg-[#1B5FED]/[0.03]"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <TerminalSquare className="w-3.5 h-3.5 text-[#1B5FED]" />
                      <span className="font-bold text-black">{skill.slug}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.05] text-black/65">
                        v{skill.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-black/45 mt-1">
                      {skill.visibility === "private" ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      <span>{skill.visibility}</span>
                      <span>·</span>
                      <span className="uppercase">{skill.status}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-sans font-semibold text-black/85 truncate max-w-[230px]">
                      {skill.publisher}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-black">{skill.downloads} pulls</div>
                    <div className="text-[10px] text-black/50">{skill.size}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {skill.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}

                      {skill.takedown && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <ShieldOff className="w-3 h-3" />
                          Quarantined
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === skill.id}
                        onClick={() => handleToggleVerify(skill)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border font-semibold text-[11px] cursor-pointer transition-colors disabled:opacity-50 ${
                          skill.verified
                            ? "border-black/15 bg-white text-black/75 hover:border-black/35"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{skill.verified ? "Unverify" : "Verify"}</span>
                      </button>

                      {skill.takedown ? (
                        <button
                          type="button"
                          disabled={busyId === skill.id}
                          onClick={() => handleQuarantineOrRestore(skill, "restore")}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === skill.id}
                          onClick={() => setQuarantineTarget(skill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] cursor-pointer disabled:opacity-50"
                        >
                          <ShieldOff className="w-3 h-3" />
                          <span>Quarantine</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── QUARANTINE CONFIRMATION MODAL ── */}
      {quarantineTarget && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-red-50">
              <div>
                <h2 className="font-sans font-bold text-base text-red-900">
                  Quarantine Kill-Switch
                </h2>
                <p className="font-mono text-[11px] text-red-700 mt-0.5">
                  {quarantineTarget.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuarantineTarget(null)}
                className="p-1.5 rounded-lg text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="font-sans text-xs text-black/75 leading-relaxed">
                Quarantining blocks <code className="font-mono font-semibold">/api/packages/download</code> requests and hides the package from public registry listings immediately.
              </p>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Audit Reason
                </label>
                <textarea
                  rows={3}
                  value={quarantineReason}
                  onChange={(e) => setQuarantineReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setQuarantineTarget(null)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busyId === quarantineTarget.id}
                  onClick={() =>
                    handleQuarantineOrRestore(quarantineTarget, "quarantine", quarantineReason)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {busyId === quarantineTarget.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldOff className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Quarantine</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
