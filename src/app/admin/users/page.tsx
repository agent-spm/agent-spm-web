"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Search,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Loader2,
  X,
  Sparkles,
  Users,
} from "lucide-react";

type AdminPlan = "free" | "pro" | "enterprise";

interface AdminUserRow {
  id: string;
  supabaseUid: string | null;
  name: string;
  email: string;
  role: string;
  orgId: string | null;
  org: string;
  orgName: string;
  plan: AdminPlan;
  seatsAllowed: number;
  skills: number;
  downloads: string;
  downloadsRaw: number;
  joined: string;
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { startImpersonation, refreshSession } = useSession();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | AdminPlan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);

  // Manage Account & Plan Grant Modal
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [grantPlan, setGrantPlan] = useState<AdminPlan>("pro");
  const [grantSeats, setGrantSeats] = useState<number>(100);
  const [savingUser, setSavingUser] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load user directory.");
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      if (statusFilter === "active" && u.status !== "Active") return false;
      if (statusFilter === "suspended" && u.status !== "Suspended") return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.org.toLowerCase().includes(q) ||
        u.orgName.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, planFilter, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectOne = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleOpenManageModal = (u: AdminUserRow) => {
    setEditingUser(u);
    setGrantPlan(u.plan);
    setGrantSeats(u.seatsAllowed || PLAN_DEFAULT_SEATS[u.plan]);
  };

  const handleGrantPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_plan",
          userId: editingUser.id,
          plan: grantPlan,
          seatsAllowed: grantSeats,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant subscription tier.");
      }

      showToast({
        title: "Plan Granted",
        message: `${editingUser.email} updated to ${grantPlan.toUpperCase()} (${grantSeats} seats).`,
        type: "success",
      });
      setEditingUser(null);
      await Promise.all([loadUsers(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Plan Grant Failed",
        message: err instanceof Error ? err.message : "Could not update user plan.",
        type: "error",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleUserStatus = async (u: AdminUserRow, targetStatus: "active" | "suspended") => {
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          userId: u.id,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update account status.");
      }

      showToast({
        title: targetStatus === "suspended" ? "Account Suspended" : "Account Reactivated",
        message: `${u.email} is now ${targetStatus}.`,
        type: targetStatus === "suspended" ? "warning" : "success",
      });
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      showToast({
        title: "Status Update Failed",
        message: err instanceof Error ? err.message : "Could not update account status.",
        type: "error",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const handleBulkAction = async (
    payload:
      | { action: "bulk_grant_plan"; plan: AdminPlan }
      | { action: "bulk_status"; status: "active" | "suspended" }
  ) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          userIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk action failed.");
      }

      showToast({
        title: "Bulk Action Applied",
        message: `Updated ${selectedIds.size} user account(s).`,
        type: "success",
      });
      setSelectedIds(new Set());
      await Promise.all([loadUsers(), refreshSession()]);
    } catch (err: unknown) {
      showToast({
        title: "Bulk Action Error",
        message: err instanceof Error ? err.message : "Failed to run bulk action.",
        type: "error",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleViewAsUser = async (u: AdminUserRow) => {
    setImpersonatingUserId(u.id);
    const ok = await startImpersonation({
      userId: u.id,
      orgId: u.orgId || undefined,
    });
    setImpersonatingUserId(null);

    if (ok) {
      showToast({
        title: `Viewing as ${u.name}`,
        message: `Loaded workspace ${u.org}.`,
        type: "info",
      });
      router.push("/app");
    } else {
      showToast({
        title: "View As Failed",
        message: "Could not switch session into target user account.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">
            Platform Users & Entitlements
          </h1>
          <p className="font-mono text-xs text-black/55 mt-1">
            Inspect user accounts, grant Pro/Enterprise plans directly, suspend accounts, or enter View As tenant mode
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-black/10 bg-white hover:bg-black/[0.03] text-black/75 font-mono text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or @workspace..."
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* ── BULK ACTION BAR ── */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-[#1B5FED]/25 bg-[#1B5FED]/[0.06] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-black">
            <Users className="w-4 h-4 text-[#1B5FED]" />
            <span>{selectedIds.size} user(s) selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => handleBulkAction({ action: "bulk_grant_plan", plan: "pro" })}
              className="px-3 py-1.5 rounded-md bg-[#1B5FED] text-white font-semibold hover:bg-[#154EC9] cursor-pointer disabled:opacity-50"
            >
              Grant Pro
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => handleBulkAction({ action: "bulk_grant_plan", plan: "enterprise" })}
              className="px-3 py-1.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 cursor-pointer disabled:opacity-50"
            >
              Grant Enterprise
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => handleBulkAction({ action: "bulk_status", status: "suspended" })}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer disabled:opacity-50"
            >
              Suspend Selected
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => handleBulkAction({ action: "bulk_status", status: "active" })}
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
            >
              Reactivate Selected
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-mono text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── USERS TABLE ── */}
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-black/10 text-black/50 uppercase bg-black/[0.02]">
              <th className="py-3.5 px-4 w-9">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="rounded border-black/25 cursor-pointer"
                  aria-label="Select all users"
                />
              </th>
              <th className="py-3.5 px-4 font-semibold">User</th>
              <th className="py-3.5 px-4 font-semibold">Workspace</th>
              <th className="py-3.5 px-4 font-semibold">Plan</th>
              <th className="py-3.5 px-4 font-semibold">Skills</th>
              <th className="py-3.5 px-4 font-semibold">Downloads</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-black/45">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B5FED]" />
                  Loading platform user directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-black/45">
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1B5FED]/[0.03] transition-colors">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleSelectOne(u.id)}
                      className="rounded border-black/25 cursor-pointer"
                      aria-label={`Select ${u.email}`}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-bold text-black">{u.name}</span>
                      {u.role === "superadmin" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 border border-amber-500/30 text-[9px] font-bold uppercase">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Staff
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-black/55">{u.email}</div>
                    <div className="text-[10px] text-black/35">Joined {u.joined}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#1B5FED]">{u.org}</div>
                    <div className="text-[10px] text-black/50 font-sans truncate max-w-[160px]">
                      {u.orgName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${planBadgeStyle(
                        u.plan
                      )}`}
                    >
                      {u.plan} · {u.seatsAllowed} seats
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">{u.skills}</td>
                  <td className="py-3.5 px-4 text-black/75">{u.downloads}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === "Suspended"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {u.status === "Active" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenManageModal(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-black/15 hover:border-[#1B5FED]/50 hover:text-[#1B5FED] bg-white text-black font-semibold text-[11px] cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Manage Plan</span>
                      </button>
                      <button
                        type="button"
                        disabled={impersonatingUserId === u.id}
                        onClick={() => handleViewAsUser(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-black hover:bg-black/85 text-white font-semibold text-[11px] cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {impersonatingUserId === u.id ? (
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

      {/* ── MANAGE ACCOUNT & GRANT PLAN MODAL ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-black/[0.02]">
              <div>
                <h2 className="font-sans font-bold text-base text-black">
                  Manage Account & Plan Entitlement
                </h2>
                <p className="font-mono text-[11px] text-black/55 mt-0.5">
                  {editingUser.name} ({editingUser.email}) · {editingUser.org}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantPlan} className="p-5 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-2">
                  Grant Subscription Tier (Free / Pro / Enterprise)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "pro", "enterprise"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        setGrantPlan(tier);
                        setGrantSeats(PLAN_DEFAULT_SEATS[tier]);
                      }}
                      className={`py-2.5 px-3 rounded-lg border font-mono text-xs font-bold uppercase cursor-pointer transition-all ${
                        grantPlan === tier
                          ? "bg-[#1B5FED] text-white border-[#1B5FED] shadow-sm"
                          : "bg-white text-black/70 border-black/15 hover:border-black/35"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-mono text-black/50 mt-1.5">
                  Updates owned workspace plan and active user entitlement immediately without checkout.
                </p>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-semibold text-black/60 mb-1.5">
                  Seats Allowed
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={grantSeats}
                  onChange={(e) => setGrantSeats(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-black/15 font-mono text-xs text-black focus:outline-none focus:border-[#1B5FED]"
                />
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-black/10">
                <button
                  type="button"
                  disabled={savingUser || editingUser.role === "superadmin"}
                  onClick={() =>
                    handleToggleUserStatus(
                      editingUser,
                      editingUser.status === "Suspended" ? "active" : "suspended"
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs font-semibold cursor-pointer disabled:opacity-40 ${
                    editingUser.status === "Suspended"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>
                    {editingUser.status === "Suspended" ? "Reactivate Account" : "Suspend Account"}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 rounded-lg border border-black/15 font-mono text-xs font-semibold text-black/70 hover:bg-black/5 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B5FED] hover:bg-[#154EC9] text-white font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {savingUser ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Grant {grantPlan.toUpperCase()} Plan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
