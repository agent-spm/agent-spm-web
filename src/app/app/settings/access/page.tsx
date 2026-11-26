"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Check,
  FileCheck,
  X,
  Lock,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useSession } from "@/lib/data/session-context";

export default function AccessPoliciesPage() {
  const { showToast } = useToast();
  const { userProfile, skills, teamMembers } = useSession();
  const [requireApproval, setRequireApproval] = useState(false);
  const [autoApprovePatch, setAutoApprovePatch] = useState(true);
  const [requiredApprovers, setRequiredApprovers] = useState("2 of 3");

  // Custom roles
  const [customRoles, setCustomRoles] = useState([
    {
      id: "cr_1",
      name: "Release Manager",
      description: "Can publish and deprecate skills; no team or billing management permissions.",
      memberCount: 0,
    },
    {
      id: "cr_2",
      name: "Analytics Reader",
      description: "Read-only access to all ingestion graphs and CSV exports across packages.",
      memberCount: 0,
    },
    {
      id: "cr_3",
      name: "Security Auditor",
      description: "Full visibility into audit logs and API key prefixes.",
      memberCount: 0,
    },
  ]);

  const [overrides, setOverrides] = useState<
    Array<{ id: string; skill: string; assignee: string; permission: string; rule: string }>
  >([]);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideSkill, setOverrideSkill] = useState("@workspace/default");
  const [overrideAssignee, setOverrideAssignee] = useState("Workspace Owner");
  const [overridePermission, setOverridePermission] = useState("Admin / Maintainer");

  const [showQueueModal, setShowQueueModal] = useState(false);

  // Keyboard shortcut [R] & Topbar event to trigger custom role modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "r" || e.key === "R") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        openCreateRoleModal();
      }
    };
    const handleCustomEvent = () => openCreateRoleModal();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-custom-role-modal", handleCustomEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-custom-role-modal", handleCustomEvent);
    };
  }, []);

  const openCreateRoleModal = () => {
    setEditingRoleId(null);
    setRoleName("");
    setRoleDesc("");
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role: { id: string; name: string; description: string }) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRoleId) {
      setCustomRoles((prev) =>
        prev.map((r) =>
          r.id === editingRoleId
            ? { ...r, name: roleName.trim(), description: roleDesc.trim() }
            : r
        )
      );
      showToast({
        title: "Custom Role Updated",
        message: `Policy privileges for "${roleName}" have been recalculated.`,
        type: "success",
      });
    } else {
      const newRole = {
        id: `cr_${Date.now()}`,
        name: roleName.trim(),
        description: roleDesc.trim() || "Custom organization permission role.",
        memberCount: 0,
      };
      setCustomRoles((prev) => [...prev, newRole]);
      showToast({
        title: "Role Created",
        message: `Custom role "${roleName}" is now available to assign.`,
        type: "success",
      });
    }
    setShowRoleModal(false);
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const newOv = {
      id: `ov_${Date.now()}`,
      skill: overrideSkill,
      assignee: overrideAssignee,
      permission: overridePermission,
      rule: "Override beats Org Role",
    };
    setOverrides((prev) => [...prev, newOv]);
    showToast({
      title: "Granular Override Active",
      message: `${overrideAssignee} granted ${overridePermission} on ${overrideSkill}.`,
      type: "success",
    });
    setShowOverrideModal(false);
  };

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
      <div className="rounded-2xl border border-black/10 bg-white p-4 font-mono text-xs text-black/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1B5FED] shrink-0" />
          <span>Built-in Owner/Admin/Member/Viewer roles are enforced server-side. Custom roles and overrides below are local policy drafts.</span>
        </div>
        <button
          onClick={openCreateRoleModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold text-[11px] shadow-sm cursor-pointer transition-all self-start sm:self-auto shrink-0"
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
            onClick={openCreateRoleModal}
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
                  <button
                    onClick={() => openEditRoleModal(role)}
                    className="hover:text-black font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setCustomRoles(customRoles.filter((r) => r.id !== role.id));
                      showToast({
                        title: "Role Deleted",
                        message: `"${role.name}" was removed.`,
                        type: "info",
                      });
                    }}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
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
              onChange={(e) => {
                setRequireApproval(e.target.checked);
                showToast({
                  title: e.target.checked ? "Approval Gating Enabled" : "Approval Gating Disabled",
                  message: e.target.checked
                    ? "Releases now require multi-admin sign-off before publishing."
                    : "Direct publishing restored for admins and maintainers.",
                  type: "info",
                });
              }}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4 cursor-pointer"
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
            onClick={() => setShowQueueModal(true)}
            className="px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase shadow-xs transition-colors cursor-pointer"
          >
            Open Queue
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">Required Approvals</label>
            <select
              value={requiredApprovers}
              onChange={(e) => {
                setRequiredApprovers(e.target.value);
                showToast({
                  title: "Threshold Updated",
                  message: `Quorum requirement set to ${e.target.value}.`,
                  type: "neutral",
                });
              }}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
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
              onChange={(e) => {
                setAutoApprovePatch(e.target.checked);
                showToast({
                  title: e.target.checked ? "Patch Auto-Approval ON" : "Patch Auto-Approval OFF",
                  type: "neutral",
                });
              }}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4 cursor-pointer"
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
            onClick={() => setShowOverrideModal(true)}
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
                      onClick={() => {
                        setOverrides(overrides.filter((o) => o.id !== ov.id));
                        showToast({
                          title: "Override Removed",
                          message: `Granular override for ${ov.skill} cleared.`,
                          type: "neutral",
                        });
                      }}
                      className="text-red-600 hover:underline font-semibold cursor-pointer"
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

      {/* ── MODAL: CREATE / EDIT CUSTOM ROLE ── */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">
                  {editingRoleId ? "Edit Custom Role" : "Create Custom Role"}
                </h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Inspector"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black focus:border-[#1B5FED] focus:outline-none shadow-xs font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Role Scope & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe permissions and target personnel responsibilities..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#1B5FED] shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-950 leading-relaxed font-mono">
                  Custom roles inherit base viewer privileges and can be augmented with granular package and workflow capability flags.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-bold shadow-md cursor-pointer"
                >
                  {editingRoleId ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD GRANULAR OVERRIDE ── */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">Add Per-Skill Override</h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOverride} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Target Skill Package
                </label>
                <select
                  value={overrideSkill}
                  onChange={(e) => setOverrideSkill(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
                >
                  {skills.length > 0 ? (
                    skills.map((s) => {
                      const slug = `${s.scope}/${s.name}`;
                      return (
                        <option key={s.id} value={slug}>
                          {slug}
                        </option>
                      );
                    })
                  ) : (
                    <option value="@workspace/default">@workspace/default</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Assignee
                </label>
                <select
                  value={overrideAssignee}
                  onChange={(e) => setOverrideAssignee(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
                >
                  {teamMembers.length > 0 ? (
                    teamMembers.map((m) => (
                      <option key={m.id} value={`${m.name} (${m.role})`}>
                        {m.name} ({m.role})
                      </option>
                    ))
                  ) : (
                    <option value={`${userProfile?.name || "Workspace Owner"} (Owner)`}>
                      {userProfile?.name || "Workspace Owner"} (Owner)
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Granular Permission Tier
                </label>
                <select
                  value={overridePermission}
                  onChange={(e) => setOverridePermission(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="Admin / Maintainer">Admin / Maintainer (Full write + publish)</option>
                  <option value="Can View Code & Run">Can View Code & Run (Execution access)</option>
                  <option value="Viewer Only">Viewer Only (Metadata read)</option>
                  <option value="Deny All">Explicit Deny (Lockout)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold shadow-md cursor-pointer"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: APPROVAL QUEUE SLIDE-OVER ── */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">Publish Approval Queue</h3>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">Queue is clear</h4>
                <p className="text-xs text-black/60 font-mono mt-1 max-w-xs mx-auto">
                  All submitted skills have met signature verification, AST static checks, and multi-admin quorum.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10 font-mono text-xs">
              <span className="text-black/50">Quorum: {requiredApprovers}</span>
              <button
                onClick={() => setShowQueueModal(false)}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-black/80 font-bold uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
