"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Activity,
  RefreshCw,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Server,
} from "lucide-react";

interface ServiceProbe {
  name: string;
  status: "operational" | "degraded";
  p50LatencyMs: number;
  uptimePercent: number;
  detail?: string;
}

export default function AdminSystemPage() {
  const { refreshSession } = useSession();
  const { showToast } = useToast();

  const [services, setServices] = useState<ServiceProbe[]>([]);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(
    "Agent SPM Scheduled Maintenance in progress. Publishing is temporarily queued."
  );
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingBanner, setSavingBanner] = useState(false);

  const loadSystemHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to probe system health.");
      }
      setServices(Array.isArray(data.services) ? data.services : []);
      if (data.maintenanceBanner) {
        setBannerEnabled(Boolean(data.maintenanceBanner.enabled));
        if (data.maintenanceBanner.message) {
          setBannerMessage(data.maintenanceBanner.message);
        }
      }
      setMigrationRequired(Boolean(data.migrationRequired));
    } catch (err: unknown) {
      showToast({
        title: "Probe Error",
        message: err instanceof Error ? err.message : "Could not load system health.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSystemHealth();
  }, [loadSystemHealth]);

  const handleSaveBanner = async (nextEnabled: boolean) => {
    setSavingBanner(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_banner",
          enabled: nextEnabled,
          message: bannerMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update maintenance banner.");
      }
      setBannerEnabled(nextEnabled);
      showToast({
        title: nextEnabled ? "Maintenance Banner Live" : "Maintenance Banner Cleared",
        message: nextEnabled
          ? "Visible immediately across all tenant workspaces."
          : "Global notice disabled cleanly.",
        type: nextEnabled ? "warning" : "success",
      });
      await Promise.all([loadSystemHealth(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Could not persist maintenance banner.",
        type: "error",
      });
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            System Health & Infrastructure Telemetry
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Real-time health probes across Supabase PostgreSQL, GoTrue Auth, Email/Billing providers, and global maintenance controls
          </p>
        </div>

        <button
          type="button"
          onClick={loadSystemHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Run Health Probes</span>
        </button>
      </div>

      {migrationRequired && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-mono text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Platform Settings Table Not Created Yet</div>
            <p className="mt-1 text-amber-900/80">
              Run{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200">
                supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql
              </code>{" "}
              in Supabase SQL Editor before persisting global maintenance banners or platform incidents.
            </p>
          </div>
        </div>
      )}

      {/* ── LIVE SERVICE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && services.length === 0 ? (
          <div className="col-span-full rounded-xl border border-black/10 bg-white p-10 text-center font-mono text-xs text-black/45">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
            Probing database and auth gateways...
          </div>
        ) : (
          services.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-sans font-bold text-sm text-black">
                  <Server className="w-4 h-4 text-[#1B5FED] flex-shrink-0" />
                  <span>{svc.name}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    svc.status === "operational"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {svc.status === "operational" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {svc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="font-mono text-[10px] uppercase text-black/45">Probe Latency</div>
                  <div className="font-mono text-lg font-bold text-black">{svc.p50LatencyMs} ms</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-black/45">90-Day SLA</div>
                  <div
                    className={`font-mono text-lg font-bold ${
                      svc.uptimePercent >= 99.9 ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {svc.uptimePercent}%
                  </div>
                </div>
              </div>

              {svc.detail && (
                <div className="pt-2 border-t border-black/5 font-mono text-[11px] text-black/50 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#1B5FED]" />
                  <span>{svc.detail}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── PERSISTENT GLOBAL MAINTENANCE BANNER CONTROL ── */}
      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base text-black">
                Global Maintenance Banner
              </h2>
              <p className="font-mono text-xs text-black/55">
                Persisted in <code className="font-semibold">platform_settings</code> and displayed across tenant <code className="font-semibold">/app</code> shells
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[11px] font-bold uppercase ${
              bannerEnabled
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-black/[0.04] text-black/55 border border-black/10"
            }`}
          >
            {bannerEnabled ? "Banner Active" : "Banner Off"}
          </span>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
            Banner Broadcast Message
          </label>
          <input
            type="text"
            value={bannerMessage}
            onChange={(e) => setBannerMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={savingBanner}
            onClick={() => handleSaveBanner(!bannerEnabled)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-semibold cursor-pointer disabled:opacity-50 ${
              bannerEnabled
                ? "bg-black hover:bg-black/85 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {savingBanner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{bannerEnabled ? "Disable Maintenance Banner" : "Enable Maintenance Banner"}</span>
          </button>

          {bannerEnabled && (
            <button
              type="button"
              disabled={savingBanner}
              onClick={() => handleSaveBanner(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-black/15 hover:bg-black/[0.03] font-mono text-xs font-semibold text-black cursor-pointer disabled:opacity-50"
            >
              Update Broadcast Text
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
