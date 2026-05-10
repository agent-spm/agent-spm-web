/**
 * Centralized environment variable validation.
 * 
 * NOTE: Supabase and Polar env vars are temporarily made optional
 * so the site can be deployed as a static coming-soon page
 * without requiring backend credentials.
 */

function optional(key: string, fallback = ""): string {
  return process.env[key] || fallback;
}

/**
 * Validated environment — import this instead of reading process.env directly.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const url = env.NEXT_PUBLIC_SUPABASE_URL;
 */
export const env = {
  // ── Supabase (temporarily optional for coming-soon deploy) ──
  NEXT_PUBLIC_SUPABASE_URL: optional("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_KEY: optional("SUPABASE_SERVICE_KEY"),

  // ── Polar.sh (temporarily optional for coming-soon deploy) ──
  POLAR_ACCESS_TOKEN: optional("POLAR_ACCESS_TOKEN"),
  POLAR_WEBHOOK_SECRET: optional("POLAR_WEBHOOK_SECRET"),

  // ── App ───────────────────────────────────────────────────
  NODE_ENV: optional("NODE_ENV", "development"),
  NEXT_PUBLIC_APP_URL: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
} as const;

export type Env = typeof env;
