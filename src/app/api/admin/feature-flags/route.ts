import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { isMissingTableError } from "@/lib/supabase/postgrest-errors";

const MIGRATION_HINT =
  "Feature flags table does not exist yet. Run supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor.";

export async function GET() {
  const { adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !adminSupabase) return errorResponse!;

  try {
    const { data, error } = await adminSupabase
      .from("feature_flags")
      .select("id, name, description, enabled, rollout_percent, target")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({
        flags: [],
        migrationRequired: true,
        warning: error.message,
      });
    }

    return NextResponse.json(
      {
        flags: (data || []).map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description || "",
          enabled: Boolean(f.enabled),
          rolloutPercent: Number(f.rollout_percent ?? 100),
          target: f.target || "All",
        })),
        migrationRequired: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load feature flags." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !ctx || !adminSupabase) return errorResponse!;

  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Flag key name is required." }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("feature_flags")
      .insert({
        name,
        description: String(body.description || "Dynamic runtime feature gate.").trim(),
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
        rollout_percent: Math.min(100, Math.max(0, Number(body.rolloutPercent ?? 100))),
        target: String(body.target || "All"),
      })
      .select("id, name, description, enabled, rollout_percent, target")
      .single();

    if (error) {
      return NextResponse.json(
        { error: isMissingTableError(error, "feature_flags") ? MIGRATION_HINT : error.message },
        { status: 500 }
      );
    }

    await adminSupabase.from("audit_log").insert({
      actor_id: ctx.publicUserId,
      action: "admin.feature_flag_create",
      target_type: "feature_flag",
      target_name: data.name,
      metadata: { severity: "warning", email: ctx.user.email },
    });

    return NextResponse.json({
      success: true,
      flag: {
        id: data.id,
        name: data.name,
        description: data.description || "",
        enabled: Boolean(data.enabled),
        rolloutPercent: Number(data.rollout_percent ?? 100),
        target: data.target || "All",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create feature flag." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { ctx, adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !ctx || !adminSupabase) return errorResponse!;

  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Flag id is required." }, { status: 400 });
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (body.rolloutPercent !== undefined) {
      patch.rollout_percent = Math.min(100, Math.max(0, Number(body.rolloutPercent)));
    }
    if (body.target !== undefined) patch.target = String(body.target);
    if (body.description !== undefined) patch.description = String(body.description);

    const { data, error } = await adminSupabase
      .from("feature_flags")
      .update(patch)
      .eq("id", id)
      .select("id, name, description, enabled, rollout_percent, target")
      .single();

    if (error) {
      return NextResponse.json(
        { error: isMissingTableError(error, "feature_flags") ? MIGRATION_HINT : error.message },
        { status: 500 }
      );
    }

    await adminSupabase.from("audit_log").insert({
      actor_id: ctx.publicUserId,
      action: "admin.feature_flag_update",
      target_type: "feature_flag",
      target_name: data.name,
      metadata: { severity: "warning", email: ctx.user.email, ...patch },
    });

    return NextResponse.json({
      success: true,
      flag: {
        id: data.id,
        name: data.name,
        description: data.description || "",
        enabled: Boolean(data.enabled),
        rolloutPercent: Number(data.rollout_percent ?? 100),
        target: data.target || "All",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update feature flag." },
      { status: 500 }
    );
  }
}
