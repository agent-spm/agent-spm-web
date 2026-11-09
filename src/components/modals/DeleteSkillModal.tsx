"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string; // e.g. "browser-tools"
  scope: string;     // e.g. "@acme-labs"
  versionCount?: number;
  totalDownloads?: number;
  onConfirmDelete: () => void;
}

export function DeleteSkillModal({
  isOpen,
  onClose,
  skillName,
  scope,
  versionCount = 2,
  totalDownloads = 142850,
  onConfirmDelete,
}: DeleteSkillModalProps) {
  const [typedName, setTypedName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const fullName = `${scope}/${skillName}`;
  const isMatch = typedName.trim() === fullName || typedName.trim() === skillName;
  const canDelete = isMatch && acknowledged;

  const handleDelete = () => {
    if (canDelete) {
      onConfirmDelete();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-red-200 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl animate-[scaleInFade_0.2s_ease-out] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-red-100 mb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-red-700">
              Permanently Delete Skill
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

        {/* Warning Impact Callout */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4 text-xs space-y-2 text-red-900">
          <div className="flex items-center gap-2 font-bold text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL REGISTRY IMPACT</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-red-800 font-mono text-[11px]">
            <li>
              All <strong className="text-red-950 font-bold">{versionCount} released versions</strong> and binary artifacts will be immediately deleted.
            </li>
            <li>
              Existing client installs ({totalDownloads.toLocaleString()} recorded runs) will begin failing with HTTP 404.
            </li>
            <li>Organization audit logs are permanently retained for regulatory compliance.</li>
            <li>
              The scope namespace will remain locked and reusable only after a <strong className="text-red-950 font-bold">30-day grace period</strong>.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Type <span className="text-red-700 font-bold">{fullName}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={fullName}
              className="w-full rounded-xl border border-red-300 bg-white px-3.5 py-2.5 text-sm font-mono text-black placeholder:text-black/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-black/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-black/20 text-red-600 focus:ring-0"
            />
            <span>
              I understand that this action is irreversible and will immediately break active downstream agents using this skill.
            </span>
          </label>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canDelete}
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              Permanently Delete Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}