"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (opts: { title: string; message?: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "success" }: { title: string; message?: string; type?: ToastType }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Stack in Bottom Right */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <div
              key={t.id}
              className="pointer-events-auto w-full rounded-xl border border-black/10 bg-white/95 backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-200 animate-[slideInRight_0.25s_cubic-bezier(0.16,1,0.3,1)] text-black flex items-start gap-3 select-none"
            >
              {/* Type Icon */}
              <div
                className={`p-1.5 rounded-lg flex-shrink-0 ${
                  isSuccess
                    ? "bg-emerald-500/15 text-emerald-600"
                    : isError
                    ? "bg-red-500/15 text-red-600"
                    : "bg-[#1B5FED]/15 text-[#1B5FED]"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-xs font-semibold font-sans text-black leading-tight">
                  {t.title}
                </div>
                {t.message && (
                  <div className="text-[11px] text-black/60 font-sans mt-0.5 leading-snug line-clamp-2">
                    {t.message}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="text-black/40 hover:text-black p-0.5 rounded cursor-pointer transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
