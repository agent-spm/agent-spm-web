import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During static SSR prerender in CI without build-time env vars, avoid throwing
  // at component mount so public/static routes compile cleanly.
  if ((!supabaseUrl || !supabaseAnonKey) && typeof window === "undefined") {
    return createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-anon-key"
    );
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
