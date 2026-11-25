import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pbcnraifbapghtcavwqs.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!anonKey) {
      return NextResponse.json({
        githubEnabled: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
      });
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: anonKey,
      },
      next: { revalidate: 10 }, // cache for 10s
    });

    if (!res.ok) {
      return NextResponse.json({
        githubEnabled: false,
        error: `Supabase settings returned status ${res.status}`,
      });
    }

    const data = await res.json();
    const githubEnabled = Boolean(data?.external?.github);

    return NextResponse.json({
      githubEnabled,
      rawExternal: data?.external || {},
    });
  } catch (err: unknown) {
    return NextResponse.json({
      githubEnabled: false,
      error: err instanceof Error ? err.message : "Failed to check provider status",
    });
  }
}
