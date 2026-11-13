"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { AVAILABLE_PERSONAS } from "@/lib/data/mock-store";
import { Sparkles, Check, X } from "lucide-react";

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonaSwitcherModal({ isOpen, onClose }: PersonaSwitcherModalProps) {
  const router = useRouter();
  const { currentPersona, setPersona } = useSession();

  if (!isOpen) return null;

  const handleSelect = (key: string) => {
    setPersona(key);
    onClose();
    if (key === "superadmin") {
      router.push("/admin");
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
            <Sparkles className="w-4 h-4 text-[#1B5FED]" />
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-black">
              Developer Persona & RBAC Switcher
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

        <p className="text-xs text-black/70 mb-4 font-sans">
          Select any persona to test access permissions, role gating, Enterprise features, and the Platform Super-Admin console in real time.
        </p>

        <div className="space-y-2">
          {Object.entries(AVAILABLE_PERSONAS).map(([key, persona]) => {
            const active = currentPersona.id === persona.id;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? "border-[#1B5FED] bg-[#1B5FED]/5 text-black shadow-sm ring-1 ring-[#1B5FED]"
                    : "border-black/10 bg-black/[0.02] text-black/80 hover:bg-black/[0.04] hover:border-black/20"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-black">
                      {persona.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        persona.isStaff
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : persona.plan === "enterprise"
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : persona.plan === "pro"
                          ? "bg-sky-100 text-[#1B5FED] border border-sky-300"
                          : "bg-black/5 text-black/60 border border-black/10"
                      }`}
                    >
                      {persona.isStaff ? "STAFF" : persona.plan}
                    </span>
                    <span className="font-mono text-[10px] text-black/50 uppercase">
                      [{persona.role}]
                    </span>
                  </div>
                  <div className="text-[11px] text-black/60 mt-1 font-sans">
                    {persona.email} • {persona.isStaff ? "Global Platform Control" : "Scoped to tenant"}
                  </div>
                </div>

                {active && <Check className="w-4 h-4 text-[#1B5FED] flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3.5 border-t border-black/10 flex items-center justify-between text-[11px] font-mono text-black/60">
          <span>
            Active Persona: <strong className="text-black">{currentPersona.name}</strong>
          </span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Local Session Active
          </span>
        </div>
      </div>
    </div>
  );
}