"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import { Users, X, AlertTriangle } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { currentOrg, teamMembers, pendingInvites, inviteMember } = useSession();

  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [message, setMessage] = useState("");
  const [sendCopy, setSendCopy] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSeatsUsed = teamMembers.length + pendingInvites.length;
  const remainingSeats = currentOrg.seatsAllowed - currentSeatsUsed;
  const isLimitReached = remainingSeats <= 0;

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;
    if (emails.includes(emailInput.trim())) return;
    setEmails([...emails, emailInput.trim()]);
    setEmailInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const removeEmail = (target: string) => {
    setEmails(emails.filter((e) => e !== target));
  };

  const handleSendInvites = (e: React.FormEvent) => {
    e.preventDefault();
    const allEmails = [...emails];
    if (emailInput.trim() && !allEmails.includes(emailInput.trim())) {
      allEmails.push(emailInput.trim());
    }

    if (allEmails.length === 0) return;

    if (allEmails.length > remainingSeats) {
      setStatusMessage(`Cannot invite ${allEmails.length} members. Only ${remainingSeats} seat(s) remaining on ${currentOrg.plan.toUpperCase()} plan.`);
      return;
    }

    let success = true;
    for (const em of allEmails) {
      const ok = inviteMember(em, role);
      if (!ok) success = false;
    }

    if (success) {
      setEmails([]);
      setEmailInput("");
      onClose();
    }
  };

  const getRoleExplainer = (r: string) => {
    switch (r) {
      case "admin":
        return "Can publish skills, manage team members, configure webhooks, and delete skills.";
      case "member":
        return "Can create and publish skills, view analytics, and read private packages.";
      case "viewer":
        return "Read-only access to organization skills and basic analytics.";
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl animate-[scaleInFade_0.2s_ease-out] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1B5FED]" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-black">
              Invite Team Members
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seat Quota Status Banner */}
        <div
          className={`mb-4 p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
            isLimitReached
              ? "border-red-300 bg-red-50 text-red-900"
              : remainingSeats <= 2
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-black/10 bg-black/[0.03] text-black/70"
          }`}
        >
          <div>
            <span>Seats Used: </span>
            <strong className="text-black">
              {currentSeatsUsed} / {currentOrg.seatsAllowed}
            </strong>
            <span> ({remainingSeats} available)</span>
          </div>
          {isLimitReached && (
            <span className="font-bold text-red-600">PLAN LIMIT REACHED</span>
          )}
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSendInvites} className="space-y-4">
          {/* Multi-email Tag Input */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Email Addresses (Enter or comma to add)
            </label>
            <div className="min-h-12 flex flex-wrap gap-1.5 p-2 rounded-xl border border-black/15 bg-white focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20 transition-all">
              {emails.map((em) => (
                <span
                  key={em}
                  className="inline-flex items-center gap-1 font-mono text-xs bg-sky-50 text-[#1B5FED] border border-sky-300 px-2 py-0.5 rounded-lg font-medium"
                >
                  {em}
                  <button
                    type="button"
                    onClick={() => removeEmail(em)}
                    className="hover:text-red-600 ml-0.5 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddEmail}
                disabled={isLimitReached}
                placeholder={emails.length === 0 ? "teammate@company.com" : ""}
                className="flex-1 bg-transparent text-sm text-black placeholder:text-black/40 focus:outline-none min-w-36 font-sans disabled:opacity-50"
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Organization Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none font-mono"
            >
              <option value="member">Member (Can publish and use skills)</option>
              <option value="admin">Admin (Can manage team and delete skills)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
            <p className="mt-1 text-[11px] text-black/60 font-sans">
              {getRoleExplainer(role)}
            </p>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Personal Message (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! Join our Agent SPM organization to start sharing agent skills..."
              className="w-full rounded-xl border border-black/15 bg-white p-2.5 text-xs text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 font-mono text-xs text-black/70 cursor-pointer">
            <input
              type="checkbox"
              checked={sendCopy}
              onChange={(e) => setSendCopy(e.target.checked)}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0"
            />
            <span>Send yourself a copy of the invitation email</span>
          </label>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLimitReached || (emails.length === 0 && !emailInput.trim())}
              className="px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              Send {emails.length > 1 ? `${emails.length} Invites` : "Invite"} [I]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}