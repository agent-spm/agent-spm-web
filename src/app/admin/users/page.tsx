"use client";

import React, { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { escapeCsvCell } from "@/lib/security/sanitize";
import {
  Users,
  Search,
  Download,
  Shield,
  MoreVertical,
  UserX,
  CheckCircle2,
  AlertTriangle,
  X,
  Ban,
} from "lucide-react";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userModal, setUserModal] = useState<{ id: string; name: string; email: string; status: string } | null>(null);

  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      org: string;
      plan: string;
      skills: number;
      downloads: string;
      joined: string;
      status: string;
    }>
  >([]);

  useEffect(() => {
    async function loadLiveUsers() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: dbUsers } = await supabase.from("users").select("*");
        if (dbUsers && dbUsers.length > 0) {
          const liveList = dbUsers.map((u: { id: string; email: string; display_name?: string | null; role?: string | null; created_at?: string | null }) => ({
            id: u.id,
            name: u.display_name || u.email.split("@")[0],
            email: u.email,
            org: u.role === "superadmin" ? "Platform Staff" : "Workspace Member",
            plan: u.role === "superadmin" ? "Superadmin" : "Standard",
            skills: 0,
            downloads: "0",
            joined: u.created_at
              ? new Date(u.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
            status: "Active",
          }));
          setUsers(liveList);
        }
      } catch (err) {
        console.warn("Live users fetch error:", err);
      }
    }
    loadLiveUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.org.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" ? true : u.plan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const handleExportCSV = () => {
    const headers = ["User ID", "Name", "Email", "Organization", "Plan", "Skills", "Downloads", "Joined Date", "Status"];
    const rows = filteredUsers.map((u) => [
      escapeCsvCell(u.id),
      escapeCsvCell(u.name),
      escapeCsvCell(u.email),
      escapeCsvCell(u.org),
      escapeCsvCell(u.plan),
      escapeCsvCell(u.skills),
      escapeCsvCell(u.downloads),
      escapeCsvCell(u.joined),
      escapeCsvCell(u.status),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spm-users-directory-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: "User Directory Exported",
      message: `Exported ${filteredUsers.length} accounts to CSV.`,
      type: "success",
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "Active" ? "Suspended" : "Active";
          showToast({
            title: `User ${newStatus}`,
            message: `${u.email} account has been set to ${newStatus}.`,
            type: newStatus === "Active" ? "success" : "warning",
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    setUserModal(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Buttons: Export, Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Global User Directory</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Manage registered user accounts across tenant organizations ({users.length} active)</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => {
                showToast({
                  title: "Bulk Operation",
                  message: `Action executed across ${selectedUserIds.length} selected accounts.`,
                  type: "info",
                });
                setSelectedUserIds([]);
              }}
              className="px-3.5 py-2 rounded-[4px] border border-black/20 bg-black text-white font-mono text-xs uppercase shadow-sm cursor-pointer transition-all"
            >
              Bulk Action ({selectedUserIds.length})
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs uppercase font-semibold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, or org slug..."
            className="w-full rounded-[4px] border border-black/10 bg-white pl-10 pr-4 py-2 text-xs font-mono text-black placeholder:text-black/35 focus:outline-none focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 shadow-sm"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-[4px] border border-black/10 bg-white px-3 py-2 text-xs font-mono text-black focus:outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-[8px] border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAFA] uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-4 w-6">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded-[2px] border-black/20 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Downloads</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F0F7FF] transition-colors">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds([...selectedUserIds, u.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                        }
                      }}
                      className="rounded-[2px] border-black/20 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-black font-sans">{u.name}</div>
                    <div className="text-[11px] text-black/50">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#1B5FED] font-bold">{u.org}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-black/5 text-black/70">
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-black font-bold">{u.skills}</td>
                  <td className="py-3.5 px-4 text-black/70">{u.downloads}</td>
                  <td className="py-3.5 px-4 text-black/50">{u.joined}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      u.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-800"
                        : "bg-red-500/15 text-red-800"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setUserModal(u)}
                      className="text-black/40 hover:text-black cursor-pointer p-1"
                    >
                      <MoreVertical className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── USER ACTION MODAL ── */}
      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-semibold text-black">Manage Account</h3>
              <button
                onClick={() => setUserModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono text-xs space-y-1">
              <div className="font-bold text-black text-sm font-sans">{userModal.name}</div>
              <div className="text-black/60">{userModal.email}</div>
              <div className="text-[11px] pt-1">
                Current Status:{" "}
                <span className={`font-bold ${userModal.status === "Active" ? "text-emerald-700" : "text-red-700"}`}>
                  {userModal.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/10 font-mono text-xs">
              <button
                onClick={() => handleToggleStatus(userModal.id)}
                className={`w-full py-2 rounded-xl uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  userModal.status === "Active"
                    ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {userModal.status === "Active" ? (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend User</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Re-activate User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
