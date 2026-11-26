import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/server-auth";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-tenant";

export async function GET(request: NextRequest) {
  const { ctx, errorResponse } = await requireAuthenticatedUser();
  if (errorResponse || !ctx) {
    return (
      errorResponse ||
      NextResponse.json({ error: "Authentication required." }, { status: 401 })
    );
  }

  try {
    const orgId = request.nextUrl.searchParams.get("orgId");
    const payload = await resolveWorkspaceContext(ctx, orgId);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err: unknown) {
    console.error("[Workspace Context] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load workspace context." },
      { status: 500 }
    );
  }
}
