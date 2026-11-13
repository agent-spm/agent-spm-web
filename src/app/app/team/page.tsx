"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/data/session-context";
import { InviteMemberModal } from "@/components/modals/InviteMemberModal";
import {
  UserPlus,
  MoreVertical,
} from "lucide-react";

export default function TeamPage() {
  const { currentOrg, teamMembers, pendingInvites, revokeInvite } = useSession();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const totalSeatsUsed = teamMembers.length + pendingInvites.length;
  const seatsRemaining = currentOrg.seatsAllowed - totalSeatsUsed;
  const usagePercent = Math.round((totalSeatsUsed / currentOrg.seatsAllowed) * 100);

  return (
    <div className="space-y-6 text-black">
      {/* ── PLAN QUOTA PROGRESS BANNER PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase font-bold text-black/60">
                ACTIVE SUBSCRIPTION SEATS
              </span>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#1B5FED] border border-sky-200">
                {currentOrg.plan.toUpperCase()} TIER
              </span>
            </div>
            <h2 className="text-xl font-bold font-sans text-black mt-1">
              {totalSeatsUsed} of {currentOrg.seatsAllowed} Seats Allocated
            </h2>
            <p className="text-xs text-black/60 font-mono mt-0.5">
              Includes {teamMembers.length} active members and {pendingInvites.length} pending invitations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              Manage Plan
            </Link>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">[I]</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-black/5 overflow-hidden">
            <div
              style={{ width: `${usagePercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 90
                  ? "bg-red-500"
                  : usagePercent >= 75
                    ? "bg-amber-500"
                    : "bg-[#1B5FED]"
              }`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-black/60">
            <span>{seatsRemaining} seats remaining before limit</span>
            <span className="text-black font-bold">{usagePercent}% utilized</span>
          </div>
        </div>
      </div>

      {/* ── ACTIVE MEMBERS TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-[#F5F5F7]/50">
          <div>
            <h3 className="text-base font-semibold text-black">Organization Members</h3>
            <p className="text-xs text-black/60 font-mono mt-0.5">Active team members with workspace access</p>
          </div>
          <span className="font-mono text-xs text-black/60">
            {teamMembers.length} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 font-mono text-[11px] uppercase tracking-wider text-black/60">
                <th className="py-3 px-6">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center font-mono text-xs font-bold text-[#1B5FED] flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-black text-xs sm:text-sm">{member.name}</div>
                        <div className="font-mono text-xs text-black/60">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-black/5 text-black border border-black/10 font-semibold">
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-black/60">
                    {member.joinedDate}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-black font-semibold">
                    {member.skillsCount} skills
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Managing role for ${member.name}`)}
                      className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-all"
                      aria-label="Member options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PENDING INVITATIONS TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-[#F5F5F7]/50">
          <div>
            <h3 className="text-base font-semibold text-black">Pending Invitations</h3>
            <p className="text-xs text-black/60 font-mono mt-0.5">Invited users awaiting acceptance</p>
          </div>
          <span className="font-mono text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold">
            {pendingInvites.length} pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 font-mono text-[11px] uppercase tracking-wider text-black/60">
                <th className="py-3 px-6">Invited Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Sent Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {pendingInvites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center font-mono text-xs text-black/50">
                    No pending invitations.
                  </td>
                </tr>
              ) : (
                pendingInvites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-black font-semibold">
                      {inv.email}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-full bg-black/5 text-black border border-black/10">
                        {inv.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-black/60">
                      {inv.sentAgo}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => alert(`Resent invitation to ${inv.email}`)}
                        className="px-3 py-1 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-mono text-xs text-black shadow-xs transition-colors"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => revokeInvite(inv.id)}
                        className="px-3 py-1 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 font-mono text-xs text-red-700 transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}