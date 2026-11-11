"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import { AuditSeverity } from "@/lib/data/mock-store";
import {
  Download,
  ChevronRight,
  Search,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

export default function AuditLogsPage() {
  const { auditEvents } = useSession();
  const { showToast } = useToast();
  const [range, setRange] = useState("7D");
  const [liveTail, setLiveTail] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp (UTC)", "Actor Name", "Actor Email", "Action", "Resource", "Severity", "IP Address", "User Agent"];
    const rows = filteredEvents.map((evt) => [
      evt.id,
      evt.timestamp,
      `"${evt.actor.name}"`,
      `"${evt.actor.email}"`,
      `"${evt.action}"`,
      `"${evt.resource}"`,
      evt.severity,
      evt.ipAddress,
      `"${evt.userAgent.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `spm-audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Audit Trail Exported (CSV)",
      message: `Downloaded ${filteredEvents.length} events for compliance verification.`,
      type: "success",
    });
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        organization: "acme-labs",
        filter: { search, severity: severityFilter, range },
        totalEvents: filteredEvents.length,
        events: filteredEvents,
      },
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `spm-audit-trail-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "Audit Trail Exported (JSON)",
      message: `Downloaded structured payload formatted for SIEM / SOC 2 ingestion.`,
      type: "success",
    });
  };

  // Simulated live tail event generation
  useEffect(() => {
    if (!liveTail) return;
    const interval = setInterval(() => {
      // live streaming indicator ping
    }, 3000);
    return () => clearInterval(interval);
  }, [liveTail]);

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.actor.name.toLowerCase().includes(search.toLowerCase()) ||
      evt.action.toLowerCase().includes(search.toLowerCase()) ||
      evt.resource.toLowerCase().includes(search.toLowerCase()) ||
      evt.ipAddress.includes(search);

    const matchesSeverity = severityFilter === "all" ? true : evt.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case "critical":
        return <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">CRITICAL</span>;
      case "warning":
        return <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">WARN</span>;
      default:
        return <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/70 border border-black/10">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── HEADER & CONTROLS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-sans text-black">Enterprise Audit Trail</h2>
              <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                1-YEAR RETENTION
              </span>
            </div>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Immutable cryptographically verifiable event stream of all sensitive organization actions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Tail Toggle */}
            <button
              onClick={() => setLiveTail(!liveTail)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-semibold transition-all cursor-pointer ${
                liveTail
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs"
                  : "border-black/10 bg-white text-black/70 hover:text-black hover:bg-black/5"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveTail ? "bg-emerald-600 animate-ping" : "bg-black/30"}`} />
              <span>{liveTail ? "Live Tail: Active" : "Enable Live Tail"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download audit trail as CSV for spreadsheet analysis"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1B5FED]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase font-semibold shadow-xs transition-colors cursor-pointer"
              title="Download structured JSON payload for SIEM / SOC 2 ingestion"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-600" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-black/10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by actor, resource, action, or IP address..."
              className="w-full rounded-xl border border-black/15 bg-white pl-9 pr-3 py-2 text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 font-mono shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="24H">Last 24 Hours</option>
              <option value="7D">Last 7 Days (Default)</option>
              <option value="30D">Last 30 Days</option>
              <option value="1Y">Full Year (Enterprise)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── AUDIT LOGS TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">UTC Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">IP & Location</th>
                <th className="py-3 px-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredEvents.map((evt) => {
                const isExpanded = expandedRow === evt.id;
                return (
                  <React.Fragment key={evt.id}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : evt.id)}
                      className="hover:bg-black/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-black/40">
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90 text-[#1B5FED]" : ""}`} />
                      </td>

                      <td className="py-3 px-4 text-black/60 whitespace-nowrap">
                        {new Date(evt.timestamp).toISOString().replace("T", " ").substring(0, 19)}
                      </td>

                      <td className="py-3 px-4 text-black font-semibold whitespace-nowrap">
                        {evt.actor.name} <span className="text-black/50 font-normal">({evt.actor.email})</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[#1B5FED] font-bold">[{evt.action}]</span>
                      </td>

                      <td className="py-3 px-4 text-black/80 truncate max-w-xs">
                        {evt.resource}
                      </td>

                      <td className="py-3 px-4 text-black/60 whitespace-nowrap">
                        <span className="mr-1.5">{evt.countryCode === "US" ? "🇺🇸" : evt.countryCode === "DE" ? "🇩🇪" : "🌐"}</span>
                        <span>{evt.ipAddress}</span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {getSeverityBadge(evt.severity)}
                      </td>
                    </tr>

                    {/* Expandable JSON Detail Payload */}
                    {isExpanded && (
                      <tr className="bg-black/[0.02] border-b border-black/5">
                        <td colSpan={7} className="p-4 pl-12">
                          <div className="p-3.5 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] shadow-inner">
                            <div className="text-white mb-1.5 font-bold">Event Metadata ({evt.id}):</div>
                            <pre className="text-[11px] overflow-x-auto text-[#7ECEFF]">{JSON.stringify(evt, null, 2)}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3 border-t border-black/10 bg-[#F5F5F7]/50 flex items-center justify-between font-mono text-xs text-black/60">
          <span>Showing 1 to {filteredEvents.length} of {auditEvents.length} recorded events</span>
          <div className="flex items-center gap-2">
            <button disabled className="px-2.5 py-1 rounded-lg border border-black/10 bg-black/5 opacity-50 cursor-not-allowed">Previous</button>
            <span className="text-black font-bold">Page 1</span>
            <button disabled className="px-2.5 py-1 rounded-lg border border-black/10 bg-black/5 opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}