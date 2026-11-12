"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import {
  TerminalSquare,
  AlertTriangle,
  ShieldCheck,
  Search,
  Scan,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Flame,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export default function AdminSkillsModerationPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState([
    {
      id: "mod_1",
      slug: "@acme-labs/browser-tools",
      version: "1.2.0",
      publisher: "alex@acme.labs",
      downloads: "142,850",
      size: "142 KB",
      flags: ["Featured"],
      takedown: false,
    },
    {
      id: "mod_2",
      slug: "@shadow-tools/crypto-drainer",
      version: "0.1.0",
      publisher: "anon@tempmail.ninja",
      downloads: "4",
      size: "84 KB",
      flags: ["Malware", "Flagged"],
      takedown: false,
    },
    {
      id: "mod_3",
      slug: "@fake-openai/chatgpt-wrapper",
      version: "2.0.1",
      publisher: "spam@scam.ru",
      downloads: "312",
      size: "112 KB",
      flags: ["Trademark", "Flagged"],
      takedown: false,
    },
    {
      id: "mod_4",
      slug: "@acme-labs/code-analysis",
      version: "0.9.4",
      publisher: "sarah@acme.labs",
      downloads: "89,400",
      size: "284 KB",
      flags: ["Featured"],
      takedown: false,
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const flaggedCount = skills.filter((s) => s.flags.includes("Flagged") && !s.takedown).length;

  const handleTakeDown = (id: string, slug: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, takedown: true } : s))
    );
    showToast({
      title: "Package Quarantined & Takedown Enforced",
      message: `${slug} has been immediately revoked across all global edge caches.`,
      type: "error",
    });
  };

  const handleRestore = (id: string, slug: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, takedown: false } : s))
    );
    showToast({
      title: "Package Restored",
      message: `${slug} has been restored to active registry distribution.`,
      type: "success",
    });
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast({
        title: "AST Security Scan Completed",
        message: "Scanned 48,910 registry packages. 2 quarantined, 0 false positives.",
        type: "success",
      });
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BUTTONS: REVIEW QUEUE, RUN SCAN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Skills Registry Moderation</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Automated malware scanning, trademark verification, and quarantine queue</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast({
                title: "Moderation Queue",
                message: `Displaying ${flaggedCount} flagged packages requiring staff action.`,
                type: "warning",
              });
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[4px] border border-red-500/30 bg-red-50 text-red-700 font-mono text-xs uppercase font-semibold cursor-pointer shadow-sm hover:bg-red-100 transition-all"
          >
            <span>Review Queue ({flaggedCount})</span>
          </button>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs uppercase font-semibold shadow-sm cursor-pointer transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Scan className="w-3.5 h-3.5" />
                <span>Run AST Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── AMBER/RED BANNER SHOWING HOW MANY SKILLS WERE FLAGGED ── */}
      {flaggedCount > 0 && (
        <div className="rounded-[8px] border border-red-500/30 bg-red-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-950 font-mono text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-red-900 text-sm font-sans">{flaggedCount} Skills Flagged by Automated AST Engine</span>
              <p className="text-red-700 text-xs mt-0.5 font-sans">
                Potential trojans, credential harvesting, and trademark infringements require immediate platform staff review.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              showToast({
                title: "Queue Filter Applied",
                message: "Showing all active flagged packages.",
                type: "info",
              });
            }}
            className="px-4 py-2 rounded-[4px] bg-red-600 hover:bg-red-700 text-white uppercase font-bold text-xs shadow-sm flex-shrink-0 cursor-pointer transition-all"
          >
            Open Queue ({flaggedCount})
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[8px] border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAFA] uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Scope / Name</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Publisher Email</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Flags</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {skills.map((sk) => {
                const isFlagged = sk.flags.includes("Flagged");
                return (
                  <tr
                    key={sk.id}
                    className={`transition-colors ${
                      sk.takedown
                        ? "bg-black/5 opacity-60"
                        : isFlagged
                          ? "bg-red-50/60 hover:bg-red-50"
                          : "hover:bg-[#F0F7FF]"
                    }`}
                  >
                    <td className="py-3.5 px-6 font-bold text-black">
                      <div className="flex items-center gap-2">
                        {sk.takedown && <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />}
                        <span className={sk.takedown ? "line-through text-black/50" : ""}>{sk.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1B5FED] font-bold">v{sk.version}</td>
                    <td className="py-3.5 px-4 text-black/70">{sk.publisher}</td>
                    <td className="py-3.5 px-4 text-black/60">{sk.downloads}</td>
                    <td className="py-3.5 px-4 text-black/50">{sk.size}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sk.flags.map((fl) => (
                          <span
                            key={fl}
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              fl === "Malware" || fl === "Flagged"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : fl === "Trademark"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-[#1B5FED]/15 text-[#1B5FED] border border-[#1B5FED]/30"
                            }`}
                          >
                            {fl}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {sk.takedown ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-red-600 font-bold uppercase text-[11px]">Quarantined</span>
                          <button
                            onClick={() => handleRestore(sk.id, sk.slug)}
                            className="px-2.5 py-1 rounded bg-black/5 hover:bg-black/10 text-black font-semibold text-[11px] cursor-pointer"
                          >
                            Restore
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTakeDown(sk.id, sk.slug)}
                          className="px-3 py-1.5 rounded-[4px] bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Quarantine Kill-Switch
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
