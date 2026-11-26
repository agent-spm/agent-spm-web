"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import {
  TerminalSquare,
  Download,
  Users,
  Activity,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Layers,
} from "lucide-react";
import { DownloadsOverTimeChart } from "@/components/dashboard/DownloadsOverTimeChart";

export default function OverviewPage() {
  const router = useRouter();
  const { currentOrg, skills, auditEvents, teamMembers, pendingInvites, apiKeys } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real KPI computations
  const totalDownloads = skills.reduce((acc, s) => acc + (s.totalDownloads || 0), 0);
  const activeMembersCount = teamMembers.length;
  const pendingInvitesCount = pendingInvites.length;

  // Top skills sorted by downloads or latest
  const topSkills = [...skills]
    .filter((s) => s.status === "published")
    .sort((a, b) => b.totalDownloads - a.totalDownloads)
    .slice(0, 5);

  const topSkillMax = Math.max(topSkills[0]?.totalDownloads || 0, 1);

  return (
    <div className="space-y-6">
      {/* ── 4 KPI CARDS (Real Supabase Registry Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Skills */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 shadow-xs relative overflow-hidden group hover:border-[#1B5FED]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-black/50 mb-3">
            <span className="font-mono text-xs uppercase font-semibold">Total Skills</span>
            <div className="p-2 rounded-[4px] bg-[#1B5FED]/10 text-[#1B5FED]">
              <TerminalSquare className="w-4 h-4" />
            </div>
          </div>
          <div suppressHydrationWarning className="text-3xl font-bold font-sans text-black tracking-tight">
            {skills.length}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{mounted ? skills.length : 0} packages live</span>
          </div>
        </div>

        {/* KPI 2: Total Downloads */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 shadow-xs relative overflow-hidden group hover:border-[#1B5FED]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-black/50 mb-3">
            <span className="font-mono text-xs uppercase font-semibold">Downloads</span>
            <div className="p-2 rounded-[4px] bg-emerald-500/10 text-emerald-700">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div suppressHydrationWarning className="text-3xl font-bold font-sans text-black tracking-tight">
            {totalDownloads.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-black/50 font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#1B5FED]" />
            <span>CLI & agent runtime pulls</span>
          </div>
        </div>

        {/* KPI 3: Team Seats */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 shadow-xs relative overflow-hidden group hover:border-[#1B5FED]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-black/50 mb-3">
            <span className="font-mono text-xs uppercase font-semibold">Team Seats</span>
            <div className="p-2 rounded-[4px] bg-purple-500/10 text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div suppressHydrationWarning className="text-3xl font-bold font-sans text-black tracking-tight">
            {activeMembersCount} <span className="text-lg text-black/40 font-normal">/ {currentOrg.seatsAllowed}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-black/50 flex items-center justify-between">
            <span suppressHydrationWarning>
              {activeMembersCount} active{pendingInvitesCount > 0 ? `, ${pendingInvitesCount} pending` : ", 0 pending"}
            </span>
            <Link href="/app/team" className="text-[#1B5FED] font-semibold hover:underline">
              Manage →
            </Link>
          </div>
        </div>

        {/* KPI 4: API Keys */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 shadow-xs relative overflow-hidden group hover:border-[#1B5FED]/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-black/50 mb-3">
            <span className="font-mono text-xs uppercase font-semibold">API Keys</span>
            <div className="p-2 rounded-[4px] bg-amber-500/10 text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div suppressHydrationWarning className="text-3xl font-bold font-sans text-black tracking-tight">
            {apiKeys.length}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-black/50 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>{apiKeys.length === 0 ? "No active keys" : `${apiKeys.length} active key${apiKeys.length > 1 ? "s" : ""}`}</span>
          </div>
        </div>
      </div>

      {/* ── LIVE DOWNLOADS TIME-SERIES CHART ── */}
      <DownloadsOverTimeChart
        title="Downloads over time"
        totalDownloads={totalDownloads}
        events={skills.map((s) => ({
          date: s.updatedAt,
          downloads: s.totalDownloads || 0,
        }))}
      />

      {/* ── SPLIT ROW: TOP SKILLS & INSTALL METHODS & ACTIVITY FEED ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Skills Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[8px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-black">Top Performing Skills</h3>
                <p className="text-xs text-black/50 font-mono mt-0.5">Ranked by 30-day downloads</p>
              </div>
              <Link href="/app/skills" className="font-mono text-xs text-[#1B5FED] font-bold hover:underline flex items-center gap-1">
                <span suppressHydrationWarning>View all {mounted ? `(${skills.length})` : ""}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topSkills.length === 0 ? (
                <div className="py-8 text-center rounded-[6px] border border-dashed border-black/15 bg-[#FAFAFA]">
                  <p className="font-mono text-xs text-black/55">
                    No skill packages published in {currentOrg.slug} yet.
                  </p>
                  <Link
                    href="/app/skills/publish"
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#1B5FED] text-white font-mono text-xs font-semibold uppercase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish First Skill</span>
                  </Link>
                </div>
              ) : (
                topSkills.map((sk) => {
                  const pct = Math.round((sk.totalDownloads / topSkillMax) * 100);
                  return (
                    <div key={sk.id} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <Link
                          href={`/app/skills/${encodeURIComponent(sk.scope)}/${encodeURIComponent(sk.name)}`}
                          className="font-bold text-black group-hover:text-[#1B5FED] transition-colors"
                        >
                          {sk.scope}/{sk.name} <span className="text-black/40 font-normal">v{sk.version}</span>
                        </Link>
                        <span className="text-black font-bold">{sk.totalDownloads.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-[#1B5FED] transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Install Methods Breakdown */}
          <div className="rounded-[8px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-black">Installation Channels</h3>
              <p className="text-xs text-black/50 font-mono mt-0.5">Distribution across runtime protocols</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-[6px] border border-black/10 bg-[#FAFAFA] text-center">
                <div className="font-mono text-xl font-bold text-[#1B5FED]">Connected</div>
                <div className="font-mono text-xs font-semibold text-black mt-1">SPM CLI</div>
                <div className="font-mono text-[10px] text-black/50 mt-0.5">spm install</div>
              </div>

              <div className="p-4 rounded-[6px] border border-black/10 bg-[#FAFAFA] text-center">
                <div className="font-mono text-xl font-bold text-purple-700">Ready</div>
                <div className="font-mono text-xs font-semibold text-black mt-1">MCP Protocol</div>
                <div className="font-mono text-[10px] text-black/50 mt-0.5">agent-spm-mcp</div>
              </div>

              <div className="p-4 rounded-[6px] border border-black/10 bg-[#FAFAFA] text-center">
                <div className="font-mono text-xl font-bold text-emerald-700">Compatible</div>
                <div className="font-mono text-xs font-semibold text-black mt-1">VS Code Ext</div>
                <div className="font-mono text-[10px] text-black/50 mt-0.5">spm-vscode</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity Feed */}
        <div className="rounded-[8px] border border-black/10 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-black">Activity Stream</h3>
              <p className="text-xs text-black/50 font-mono mt-0.5">Shared audit event pipeline</p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {auditEvents.slice(0, 8).map((evt) => (
              <div key={evt.id} className="p-3 rounded-[6px] border border-black/5 bg-[#FAFAFA] hover:bg-[#F0F7FF] transition-all space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-black/50">
                  <span className="text-black font-semibold">{evt.actor.name}</span>
                  <span suppressHydrationWarning className="flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3 text-black/40" />
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-black/80 font-sans">
                  <span className="font-mono text-[#1B5FED] font-bold uppercase text-[10px]">[{evt.action}]</span>{" "}
                  <span className="font-mono text-xs text-black">{evt.resource}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 text-center">
            <Link
              href="/app/settings/audit"
              className="font-mono text-xs text-[#1B5FED] font-bold hover:underline"
            >
              Explore Full Audit Logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
