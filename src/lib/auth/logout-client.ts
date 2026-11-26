"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Performs complete client + server logout:
 * 1. Signs out Supabase browser session locally while tokens exist.
 * 2. Invokes server POST /api/auth/logout to revoke tokens globally & expire cookies.
 * 3. Scrubs auth/persona/impersonation/Supabase keys from browser storage.
 */
export async function performFullLogout(redirectTo = "/login?logged_out=1"): Promise<void> {
  try {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch (e) {
    console.warn("Supabase client signOut warning:", e);
  }

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.warn("Server logout warning:", e);
  }

  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("sb-") ||
            key.startsWith("spm_") ||
            key.includes("supabase.auth"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage access restrictions
    }

    try {
      sessionStorage.clear();
    } catch {
      // Ignore storage access restrictions
    }

    window.location.href = redirectTo;
  }
}
