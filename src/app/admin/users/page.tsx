"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Download,
  Shield,
  MoreVertical,
  UserX,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const [users, setUsers] = useState([
    { id: "u_1", name: "Alex Chen", email: "alex@acme.labs", org: "@acme-labs", plan: "Pro", skills: 6, downloads: "142k", joined: "Jan 15, 2026", status: "Active" },
    { id: "u_2", name: "Sarah Lin", email: "sarah@acme.labs", org: "@acme-labs", plan: "Pro", skills: 4, downloads: "89k", joined: "Feb 01, 2026", status: "Active" },
    { id: "u_3", name: "Marcus Vance", email: "marcus.v@acme.corp", org: "@acme-enterprise", plan: "Enterprise", skills: 18, downloads: "412k", joined: "Aug 10, 2025", status: "Active" },
    { id: "u_4", name: "Bot Crawler", email: "crawler@darknet.io", org: "@rogue-agent", plan: "Free", skills: 1, downloads: "12", joined: "Nov 02, 2026", status: "Suspended" },
    { id: "u_5", name: "Elena Rostova", email: "elena@acme.labs", org: "@personal-dev", plan: "Free", skills: 0, downloads: "0", joined: "Jun 22, 2026", status: "Active" },
    { id: "u_6", name: "David Kim", email: "david@acme.labs", org: "@acme-labs", plan: "Pro", skills: 2, downloads: "24k", joined: "Mar 10, 2026", status: "Active" },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.org.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" ? true : u.plan.toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header Buttons: Export, Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Global User Directory</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Manage 14,820 user accounts across all tenant organizations</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Bulk Action menu opened.")}
            className="px-3.5 py-2 rounded-[4px] border border-black/10 bg-white hover:bg-[#F5F5F5] text-black font-mono text-xs uppercase shadow-sm cursor-pointer transition-all"
          >
            Bulk Action
          </button>
          <button
            onClick={() => alert("Exported full user registry CSV.")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs uppercase font-semibold shadow-sm cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
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
                <th className="py-3 px-4 w-6"><input type="checkbox" className="rounded-[2px] border-black/20" /></th>
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
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded-[2px] border-black/20" /></td>
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
                      onClick={() => alert(`Suspend/Edit ${u.email}`)}
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
    </div>
  );
}
