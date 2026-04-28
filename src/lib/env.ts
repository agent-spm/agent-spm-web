/**
 * Centralized environment variable validation.
 * Throws at build/boot time if any required variable is missing,
 * preventing hard-to-debug runtime errors.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
        `   Add it to your .env.local file or deployment environment.`
    );
  }
  return value;
}

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
  // ── Supabase ──────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: required("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_KEY: required("SUPABASE_SERVICE_KEY"),

  // ── Polar.sh ──────────────────────────────────────────────
  POLAR_ACCESS_TOKEN: optional("POLAR_ACCESS_TOKEN"),
  POLAR_WEBHOOK_SECRET: optional("POLAR_WEBHOOK_SECRET"),

  // ── App ───────────────────────────────────────────────────
  NODE_ENV: optional("NODE_ENV", "development"),
  NEXT_PUBLIC_APP_URL: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
} as const;

export type Env = typeof env;
