"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import { KeyRound, X, Copy, Check, AlertTriangle } from "lucide-react";

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateApiKeyModal({ isOpen, onClose }: CreateApiKeyModalProps) {
  const { createApiKey } = useSession();
  const [name, setName] = useState("");
  const [type, setType] = useState<"live" | "read-only">("live");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const fullKey = createApiKey(name.trim(), type);
    setGeneratedKey(fullKey);
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedKey(null);
    setName("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl animate-[scaleInFade_0.2s_ease-out] text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#1B5FED]" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-black">
              {generatedKey ? "API Key Created" : "Create New API Key"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-black/50 hover:text-black hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Save this secret key now.</strong> It will never be shown again after you dismiss this modal. Only the masked prefix will remain visible.
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                Secret Token
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-black/15 bg-black/[0.02] font-mono text-xs text-black break-all">
                <span className="flex-1 font-semibold">{generatedKey}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B5FED] text-white hover:bg-[#1B5FED]/90 transition-all font-mono text-[11px] uppercase flex-shrink-0 cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-black transition-all cursor-pointer"
              >
                I have saved this key [Done]
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                Key Description Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CI publish bot, local dev, staging deploy"
                className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                Key Permissions Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setType("live")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    type === "live"
                      ? "border-[#1B5FED] bg-[#1B5FED]/5 text-black ring-1 ring-[#1B5FED] shadow-sm"
                      : "border-black/10 bg-black/[0.02] text-black/70 hover:bg-black/[0.04]"
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-black">Live Key</div>
                  <div className="font-mono text-[10px] text-[#1B5FED] font-medium mt-0.5">prefix: spm_live_...</div>
                  <p className="text-[11px] text-black/60 mt-1 font-sans">
                    Can publish and deprecate skills, manage registry packages.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setType("read-only")}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    type === "read-only"
                      ? "border-[#1B5FED] bg-[#1B5FED]/5 text-black ring-1 ring-[#1B5FED] shadow-sm"
                      : "border-black/10 bg-black/[0.02] text-black/70 hover:bg-black/[0.04]"
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-black">Read-Only Key</div>
                  <div className="font-mono text-[10px] text-black/60 font-medium mt-0.5">prefix: spm_read_...</div>
                  <p className="text-[11px] text-black/60 mt-1 font-sans">
                    Can query telemetry metrics and install private packages.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                Generate Token [K]
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}