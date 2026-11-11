"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  Check,
  FileCheck,
} from "lucide-react";

export default function AccessPoliciesPage() {
  const [requireApproval, setRequireApproval] = useState(false);
  const [autoApprovePatch, setAutoApprovePatch] = useState(true);
  const [requiredApprovers, setRequiredApprovers] = useState("2 of 3");

  // Custom roles
  const [customRoles, setCustomRoles] = useState([
    {
      id: "cr_1",
      name: "Release Manager",
      description: "Can publish and deprecate skills; no team or billing management permissions.",
      memberCount: 2,
    },
    {
      id: "cr_2",
      name: "Analytics Reader",
      description: "Read-only access to all ingestion graphs and CSV exports across packages.",
      memberCount: 1,
    },
    {
      id: "cr_3",
      name: "Security Auditor",
      description: "Full visibility into immutable audit logs, IP geolocations, and API key prefixes.",
      memberCount: 1,
    },
  ]);

  // Per-skill overrides
  const [overrides, setOverrides] = useState([
    { id: "ov_1", skill: "@acme-labs/security-scanner", assignee: "Elena Rostova (Viewer)", permission: "Can View Code & Run", rule: "Override beats Org Role" },
    { id: "ov_2", skill: "@acme-labs/code-analysis", assignee: "David Kim (Member)", permission: "Admin / Maintainer", rule: "Override beats Org Role" },
  ]);

  const permissions = [
    { name: "Manage billing", owner: true, admin: false, member: false, viewer: false },
    { name: "Manage team", owner: true, admin: true, member: false, viewer: false },
    { name: "Delete skills", owner: true, admin: true, member: false, viewer: false },
    { name: "Publish skills", owner: true, admin: true, member: true, viewer: false },
    { name: "Create API keys", owner: true, admin: true, member: true, viewer: false },
    { name: "View analytics", owner: true, admin: true, member: true, viewer: true },
    { name: "View skills", owner: true, admin: true, member: true, viewer: true },
  ];

  return (
    <div className="space-y-6 text-black">
      {/* ── INHERITANCE BANNER PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 font-mono text-xs text-black/80 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1B5FED]" />
          <span>Permissions are inherited org-wide. Per-skill granular overrides take priority.</span>
        </div>
        <button
          onClick={() => alert("Custom Role builder opened.")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold text-[11px] shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Custom Role [R]</span>
        </button>
      </div>

      {/* ── BUILT-IN PERMISSIONS MATRIX PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 bg-[#F5F5F7]/50">
          <h3 className="text-base font-semibold text-black">Built-in Role Permissions Matrix</h3>
          <p className="text-xs font-mono text-black/60 mt-0.5">Default capability rights for organization members</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Permission</th>
                <th className="py-3 px-6 text-center">Owner</th>
                <th className="py-3 px-6 text-center">Admin</th>
                <th className="py-3 px-6 text-center">Member</th>
                <th className="py-3 px-6 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {permissions.map((p) => (
                <tr key={p.name} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3.5 px-6 font-medium text-black">{p.name}</td>
                  <td className="py-3.5 px-6 text-center">
                    {p.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-black/30">—</span>}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {p.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-black/30">—</span>}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {p.member ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-black/30">—</span>}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {p.viewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <span className="text-black/30">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CUSTOM ROLES (ENTERPRISE) ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-black">Custom Roles</h3>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs font-mono text-black/60 mt-0.5">Tailored access tiers for specialized corporate functions</p>
          </div>
          <button
            onClick={() => alert("New role creator opened.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {customRoles.map((role) => (
            <div key={role.id} className="p-4 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.03] flex flex-col justify-between space-y-3 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-black">{role.name}</span>
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 font-bold border border-purple-300">
                    CUSTOM
                  </span>
                </div>
                <p className="text-xs text-black/70 mt-1 font-sans">{role.description}</p>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-black/60 pt-2 border-t border-black/10">
                <span>{role.memberCount} members assigned</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => alert(`Editing ${role.name}`)} className="hover:text-black font-medium">Edit</button>
                  <button onClick={() => setCustomRoles(customRoles.filter(r => r.id !== role.id))} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PUBLISH APPROVAL WORKFLOW ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/10">
          <div>
            <h3 className="text-base font-semibold text-black">Publish Approval Workflow</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">Require multi-admin sign-off before releasing packages to the public registry</p>
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-black cursor-pointer select-none">
            <span className="text-black/70">Require approval before publishing:</span>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4"
            />
          </label>
        </div>

        {/* Pending Queue Banner */}
        <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-black/70">
            <FileCheck className="w-4 h-4 text-[#1B5FED]" />
            <span>0 publish requests currently pending approval</span>
          </div>
          <button
            onClick={() => alert("Approval Queue is currently empty.")}
            className="px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase shadow-xs transition-colors"
          >
            Open Queue
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">Required Approvals</label>
            <select
              value={requiredApprovers}
              onChange={(e) => setRequiredApprovers(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="1 of 3">1 of 3 Admins</option>
              <option value="2 of 3">2 of 3 Admins (Recommended)</option>
              <option value="all">Unanimous (All Admins)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/[0.01]">
            <div>
              <div className="text-black font-bold">Auto-Approve Patch Versions</div>
              <div className="text-[11px] text-black/60 font-sans">Allow semver patch releases (0.0.x) without approval</div>
            </div>
            <input
              type="checkbox"
              checked={autoApprovePatch}
              onChange={(e) => setAutoApprovePatch(e.target.checked)}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* ── PER-SKILL PERMISSION OVERRIDES ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-[#F5F5F7]/50">
          <div>
            <h3 className="text-base font-semibold text-black">Per-Skill Explicit Overrides</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">Granular package-level overrides that beat org roles</p>
          </div>
          <button
            onClick={() => alert("Added new skill override.")}
            className="px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-bold shadow-xs cursor-pointer transition-all"
          >
            Add Override
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Skill</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Permission</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {overrides.map((ov) => (
                <tr key={ov.id} className="hover:bg-black/[0.02]">
                  <td className="py-3.5 px-6 font-bold text-black">{ov.skill}</td>
                  <td className="py-3.5 px-4 text-black/70">{ov.assignee}</td>
                  <td className="py-3.5 px-4 text-[#1B5FED] font-semibold">{ov.permission}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setOverrides(overrides.filter(o => o.id !== ov.id))}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Remove
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