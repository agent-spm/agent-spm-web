"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Building2,
  Eye,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ShieldAlert,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Users,
  HardDrive,
  TerminalSquare,
} from "lucide-react";

type AdminPlan = "free" | "pro" | "enterprise";

interface AdminOrgRow {
  id: string;
  slug: string;
  rawSlug: string;
  name: string;
  ownerEmail: string;
  ownerName: string;
  ownerUserId: string | null;
  plan: AdminPlan;
  planLabel: string;
  seatsUsed: number;
  seatsAllowed: number;
  seats: string;
  skills: number;
  storage: string;
  status: "Active" | "Suspended";
}

const PLAN_DEFAULT_SEATS: Record<AdminPlan, number> = {
  free: 3,
  pro: 100,
  enterprise: 500,
};

function planBadgeStyle(plan: AdminPlan): string {
  if (plan === "enterprise") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  if (plan === "pro") {
    return "bg-[#1B5FED]/10 text-[#1B5FED] border-[#1B5FED]/25";
  }
  return "bg-black/[0.04] text-black/65 border-black/15";
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { startImpersonation, refreshSession } = useSession();
  const { showToast } = useToast();

  const [orgs, setOrgs] = useState<AdminOrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | AdminPlan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [impersonatingOrgId, setImpersonatingOrgId] = useState<string | null>(null);

  // Manage Plan & Status modal state
  const [editingOrg, setEditingOrg] = useState<AdminOrgRow | null>(null);
  const [editPlan, setEditPlan] = useState<AdminPlan>("pro");
  const [editSeats, setEditSeats] = useState<number>(100);
  const [editStatus, setEditStatus] = useState<"Active" | "Suspended">("Active");
  const [savingEdit, setSavingEdit] = useState(false);

  // Provision Tenant modal state
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provName, setProvName] = useState("");
  const [provSlug, setProvSlug] = useState("");
  const [provOwnerEmail, setProvOwnerEmail] = useState("");
  const [provPlan, setProvPlan] = useState<AdminPlan>("pro");
  const [provSeats, setProvSeats] = useState<number>(100);
  const [provisioning, setProvisioning] = useState(false);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/organizations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load tenant organizations.");
      }
      setOrgs(Array.isArray(data.organizations) ? data.organizations : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const filteredOrgs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orgs.filter((o) => {
      if (planFilter !== "all" && o.plan !== planFilter) return false;
      if (statusFilter === "active" && o.status !== "Active") return false;
      if (statusFilter === "suspended" && o.status !== "Suspended") return false;
      if (!q) return true;
      return (
        o.slug.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.ownerEmail.toLowerCase().includes(q) ||
        o.ownerName.toLowerCase().includes(q)
      );
    });
  }, [orgs, searchQuery, planFilter, statusFilter]);

  const stats = useMemo(() => {
    const activeCount = orgs.filter((o) => o.status === "Active").length;
    const paidCount = orgs.filter((o) => o.plan === "pro" || o.plan === "enterprise").length;
    const totalSkills = orgs.reduce((sum, o) => sum + o.skills, 0);
    return { total: orgs.length, activeCount, paidCount, totalSkills };
  }, [orgs]);

  const handleOpenManage = (org: AdminOrgRow) => {
    setEditingOrg(org);
    setEditPlan(org.plan);
    setEditSeats(org.seatsAllowed || PLAN_DEFAULT_SEATS[org.plan]);
    setEditStatus(org.status);
  };

  const handleSelectEditPlan = (nextPlan: AdminPlan) => {
    setEditPlan(nextPlan);
    setEditSeats(PLAN_DEFAULT_SEATS[nextPlan]);
  };

  const handleSaveOrgChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setSavingEdit(true);
    try {
      const planRes = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_plan",
          orgId: editingOrg.id,
          plan: editPlan,
          seatsAllowed: editSeats,
        }),
      });
      const planData = await planRes.json();
      if (!planRes.ok) {
        throw new Error(planData.error || "Failed to update organization plan.");
      }

      if (editStatus !== editingOrg.status) {
        const statusRes = await fetch("/api/admin/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "toggle_status",
            orgId: editingOrg.id,
            status: editStatus === "Suspended" ? "suspended" : "active",
          }),
        });
        const statusData = await statusRes.json();
        if (!statusRes.ok) {
          throw new Error(statusData.error || "Plan updated, but status update failed.");
        }
      }

      showToast({
        title: "Workspace Updated",
        message: `${editingOrg.slug} set to ${editPlan.toUpperCase()} (${editSeats} seats).`,
        type: "success",
      });
      setEditingOrg(null);
      await Promise.all([loadOrgs(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Update Failed",
        message: err instanceof Error ? err.message : "Could not save organization settings.",
        type: "error",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleViewAsOrg = async (org: AdminOrgRow) => {
    setImpersonatingOrgId(org.id);
    const ok = await startImpersonation({
      orgId: org.id,
      userId: org.ownerUserId || undefined,
    });
    setImpersonatingOrgId(null);

    if (ok) {
      showToast({
        title: `Viewing as ${org.slug}`,
        message: "Switched tenant session context.",
        type: "info",
      });
      router.push("/app");
    } else {
      showToast({
        title: "View As Failed",
        message: "Unable to enter tenant impersonation context.",
        type: "error",
      });
    }
  };

  const handleProvisionOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provSlug.trim()) {
      showToast({
        title: "Missing Fields",
        message: "Organization name and namespace slug are required.",
        type: "warning",
      });
      return;
    }

    setProvisioning(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "provision",
          name: provName.trim(),
          slug: provSlug.trim().replace(/^@/, ""),
          ownerEmail: provOwnerEmail.trim(),
          plan: provPlan,
          seatsAllowed: provSeats,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision tenant organization.");
      }

      showToast({
        title: "Tenant Provisioned",
        message: `Created @${data.organization?.slug || provSlug.replace(/^@/, "")} on ${provPlan.toUpperCase()}.`,
        type: "success",
      });
      setShowProvisionModal(false);
      setProvName("");
      setProvSlug("");
      setProvOwnerEmail("");
      setProvPlan("pro");
      setProvSeats(100);
      await loadOrgs();
    } catch (err: unknown) {
      showToast({
        title: "Provisioning Failed",
        message: err instanceof Error ? err.message : "Could not create organization.",
        type: "error",
      });
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            Tenant Organizations
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Manage registered workspaces, grant Pro/Enterprise tiers, and inspect any tenant session ({stats.activeCount} active of {stats.total})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOrgs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B5FED] hover:bg-[#154EC9] text-white font-mono text-xs font-semibold shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Tenant</span>
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-black/50 mb-1.5">
            <span className="font-mono text-[11px] uppercase font-semibold">Total Workspaces</span>
            <Building2 className="w-4 h-4 text-[#1B5FED]" />
          </div>
          <div className="text-2xl font-bold font-sans text-black">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-black/50 mb-1.5">
            <span className="font-mono text-[11px] uppercase font-semibold">Paid / Granted</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-sans text-black">{stats.paidCount}</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-black/50 mb-1.5">
            <span className="font-mono text-[11px] uppercase font-semibold">Published Skills</span>
            <TerminalSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-sans text-black">{stats.totalSkills}</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-black/50 mb-1.5">
            <span className="font-mono text-[11px] uppercase font-semibold">Active Tenants</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-sans text-black">{stats.activeCount}</div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @slug, organization name, or owner email..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-black/10 bg-white font-mono text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-[#1B5FED]"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as "all" | AdminPlan)}
          className="px-3 py-2 rounded-lg border border-black/10 bg-white font-mono text-xs text-black cursor-pointer focus:outline-none focus:border-[#1B5FED]"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
          className="px-3 py-2 rounded-lg border border-black/10 bg-white font-mono text-xs text-black cursor-pointer focus:outline-none focus:border-[#1B5FED]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-mono text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-black/10 text-black/50 uppercase bg-black/[0.02]">
              <th className="py-3.5 px-4 font-semibold">Organization</th>
              <th className="py-3.5 px-4 font-semibold">Plan Tier</th>
              <th className="py-3.5 px-4 font-semibold">Seats</th>
              <th className="py-3.5 px-4 font-semibold">Skills</th>
              <th className="py-3.5 px-4 font-semibold">Storage</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading && orgs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-black/45">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
                  Loading tenant organizations from PostgreSQL...
                </td>
              </tr>
            ) : filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-black/45">
                  No tenant organizations match the active filter.
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-[#1B5FED]/[0.03] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#1B5FED]">{org.slug}</div>
                    <div className="text-[11px] font-sans text-black/80 font-medium">{org.name}</div>
                    <div className="text-[10px] text-black/45">{org.ownerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${planBadgeStyle(
                        org.plan
                      )}`}
                    >
                      {org.planLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-black">{org.seats}</td>
                  <td className="py-3.5 px-4 font-bold text-black">{org.skills}</td>
                  <td className="py-3.5 px-4 text-black/70">
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-black/35" />
                      {org.storage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        org.status === "Suspended"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {org.status === "Active" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenManage(org)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-black/15 hover:border-[#1B5FED]/50 hover:text-[#1B5FED] bg-white text-black font-semibold text-[11px] cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Manage Plan</span>
                      </button>
                      <button
                        type="button"
                        disabled={impersonatingOrgId === org.id}
                        onClick={() => handleViewAsOrg(org)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-black hover:bg-black/85 text-white font-semibold text-[11px] cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {impersonatingOrgId === org.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>View As</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MANAGE PLAN & STATUS MODAL ── */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <div>
                <h2 className="font-sans font-bold text-base text-black">
                  Grant Plan & Manage Workspace
                </h2>
                <p className="font-mono text-[11px] text-black/55 mt-0.5">
                  {editingOrg.slug} · {editingOrg.ownerEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrg(null)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrgChanges} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-2">
                  Subscription Tier (Superadmin Grant)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "pro", "enterprise"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleSelectEditPlan(tier)}
                      className={`py-2.5 px-3 rounded-lg border font-mono text-xs font-bold uppercase cursor-pointer transition-all ${
                        editPlan === tier
                          ? "bg-[#1B5FED] text-white border-[#1B5FED] shadow-sm"
                          : "bg-white text-black/70 border-black/15 hover:border-black/35"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Allocated Member Seats
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={editSeats}
                  onChange={(e) => setEditSeats(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Workspace Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Active", "Suspended"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 px-3 rounded-lg border font-mono text-xs font-semibold cursor-pointer transition-colors ${
                        editStatus === st
                          ? st === "Suspended"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-black/70 border-black/15 hover:border-black/35"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] hover:bg-[#154EC9] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Grant Access</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROVISION TENANT MODAL ── */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <div>
                <h2 className="font-sans font-bold text-base text-black">
                  Provision New Tenant Workspace
                </h2>
                <p className="font-mono text-[11px] text-black/55 mt-0.5">
                  Create organization record and assign owner entitlement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionOrg} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProvName(val);
                    if (!provSlug) {
                      setProvSlug(
                        val
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }
                  }}
                  placeholder="Acme Robotics"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-sans text-sm text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Namespace Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-black/45">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={provSlug}
                    onChange={(e) => setProvSlug(e.target.value.replace(/^@/, ""))}
                    placeholder="acme-robotics"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Owner Email (Optional existing user)
                </label>
                <input
                  type="email"
                  value={provOwnerEmail}
                  onChange={(e) => setProvOwnerEmail(e.target.value)}
                  placeholder="founder@acme.ai"
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Initial Plan
                  </label>
                  <select
                    value={provPlan}
                    onChange={(e) => {
                      const next = e.target.value as AdminPlan;
                      setProvPlan(next);
                      setProvSeats(PLAN_DEFAULT_SEATS[next]);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black bg-white focus:outline-none focus:border-[#1B5FED]"
                  >
                    <option value="free">Free (3 seats)</option>
                    <option value="pro">Pro (100 seats)</option>
                    <option value="enterprise">Enterprise (500 seats)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                    Seats Quota
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={provSeats}
                    onChange={(e) => setProvSeats(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] hover:bg-[#154EC9] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {provisioning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
