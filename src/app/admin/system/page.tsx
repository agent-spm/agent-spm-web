"use client";

import React, { useState } from "react";
import { SEED_SYSTEM_SERVICES } from "@/lib/data/mock-store";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Radio,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function SystemHealthPage() {
  const [broadcastActive, setBroadcastActive] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">System Health &amp; Infrastructure Telemetry</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Real-time daemon health, Redis queue worker saturation, and failover status</p>
        </div>

        <button
          onClick={() => setBroadcastActive(!broadcastActive)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[4px] border font-mono text-xs uppercase font-semibold transition-all cursor-pointer shadow-sm ${
            broadcastActive
              ? "border-red-500/40 bg-red-100 text-red-800 animate-pulse"
              : "border-black/10 bg-white text-black hover:bg-[#F5F5F5]"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{broadcastActive ? "Broadcast Banner Active" : "Trigger Maintenance Banner"}</span>
        </button>
      </div>

      {broadcastActive && (
        <div className="p-4 rounded-[8px] border border-red-500/30 bg-red-50 font-mono text-xs text-red-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            <span>GLOBAL BROADCAST: &ldquo;Agent SPM Scheduled Maintenance in progress. Publishing is temporarily queued.&rdquo;</span>
          </div>
          <button onClick={() => setBroadcastActive(false)} className="text-red-700 hover:text-black font-bold uppercase text-[11px] cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of 6 core services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEED_SYSTEM_SERVICES.map((service) => (
          <div key={service.name} className="p-5 rounded-[8px] border border-black/10 bg-white shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-sm">{service.name}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                service.status === "operational"
                  ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-800 border border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${service.status === "operational" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                {service.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5">
              <div>
                <div className="text-[10px] text-black/50 uppercase">P50 Latency</div>
                <div className="text-xl font-bold font-sans text-black mt-0.5">{service.p50LatencyMs} ms</div>
              </div>
              <div>
                <div className="text-[10px] text-black/50 uppercase">90-Day SLA</div>
                <div className="text-xl font-bold font-sans text-emerald-700 mt-0.5">{service.uptimePercent}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 text-[11px] text-black/50 flex items-center justify-between">
              <span>Nodes: 24 active</span>
              <button onClick={() => alert(`Purged cache on ${service.name}`)} className="text-[#1B5FED] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" />
                <span>Restart Service</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
