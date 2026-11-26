import { NextResponse } from "next/server";
import { buildAuthIdentityLookup, requireSuperAdmin } from "@/lib/auth/admin-guard";
import { formatStorageBytes } from "@/lib/admin/plan-grants";
import { isMissingColumnError } from "@/lib/supabase/postgrest-errors";

export async function GET() {
  const { adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !adminSupabase) return errorResponse!;

  try {
    const [
      { data: dbPkgs },
      { data: dbUsers },
      { data: dbVersions },
      { githubIdByUid },
    ] = await Promise.all([
      adminSupabase
        .from("packages")
        .select("*")
        .order("total_downloads", { ascending: false }),
      adminSupabase.from("users").select("id, supabase_uid, email, display_name"),
      adminSupabase.from("package_versions").select("package_name, size_bytes, integrity"),
      buildAuthIdentityLookup(adminSupabase),
    ]);

    const userLookup = new Map<string, { email: string; name: string }>();
    for (const u of dbUsers || []) {
      const entry = { email: u.email, name: u.display_name || u.email.split("@")[0] };
      userLookup.set(u.id, entry);
      if (u.supabase_uid) {
        userLookup.set(u.supabase_uid, entry);
        const ghId = githubIdByUid.get(u.supabase_uid);
        if (ghId) userLookup.set(ghId, entry);
      }
    }

    const versionSizeMap = new Map<string, number>();
    const integrityMap = new Map<string, string>();
    for (const v of dbVersions || []) {
      versionSizeMap.set(
        v.package_name,
        Math.max(versionSizeMap.get(v.package_name) || 0, Number(v.size_bytes) || 0)
      );
      if (v.integrity) integrityMap.set(v.package_name, v.integrity);
    }

    const skills = (dbPkgs || []).map((p) => {
      const fullName = p.name.startsWith("@") ? p.name : `@agent-spm/${p.name}`;
      const leafName = p.name.includes("/") ? p.name.split("/")[1] : p.name;
      const ownerInfo = p.owner_id ? userLookup.get(p.owner_id) : undefined;
      const sizeBytes = versionSizeMap.get(p.name) || versionSizeMap.get(leafName) || 0;
      const integrity = integrityMap.get(p.name) || integrityMap.get(leafName) || "";
      const isQuarantined = p.status === "quarantined";
      const needsReview =
        !p.verified && (!integrity || integrity.includes("pending"));

      const flags: string[] = [];
      if (p.verified) flags.push("Verified");
      else flags.push("Community");
      if (isQuarantined) flags.push("Quarantined");
      else if (needsReview) flags.push("Flagged");

      return {
        id: p.id,
        rawName: p.name,
        slug: fullName,
        version: p.latest_version || "1.0.0",
        publisher: ownerInfo ? `${ownerInfo.name} (${ownerInfo.email})` : p.owner_id || "community",
        publisherEmail: ownerInfo?.email || p.owner_id || "community",
        downloads: (p.total_downloads || 0).toLocaleString(),
        size: formatStorageBytes(sizeBytes),
        verified: Boolean(p.verified),
        visibility: p.visibility || "public",
        status: p.status || "published",
        flags,
        takedown: isQuarantined,
      };
    });

    return NextResponse.json(
      { skills },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    console.error("[Admin Skills] GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load skills registry." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { ctx, adminSupabase, errorResponse } = await requireSuperAdmin();
  if (errorResponse || !ctx || !adminSupabase) return errorResponse!;

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "run_ast_scan") {
      const { data: pkgs } = await adminSupabase
        .from("packages")
        .select("id, name, description, verified, visibility");
      const totalScanned = (pkgs || []).length;
      const unverifiedCount = (pkgs || []).filter((p) => !p.verified).length;

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: "admin.ast_scan",
        target_type: "registry",
        target_name: `${totalScanned} packages`,
        metadata: {
          severity: "info",
          email: ctx.user.email,
          totalScanned,
          unverifiedCount,
        },
      });

      return NextResponse.json({
        success: true,
        totalScanned,
        flagged: unverifiedCount,
      });
    }

    const packageId = String(body.packageId || "").trim();
    if (!packageId) {
      return NextResponse.json({ error: "packageId is required." }, { status: 400 });
    }

    if (action === "quarantine" || action === "restore") {
      const nextStatus = action === "quarantine" ? "quarantined" : "published";
      const { error: updErr } = await adminSupabase
        .from("packages")
        .update({
          status: nextStatus,
          quarantine_reason:
            action === "quarantine" ? String(body.reason || "Quarantined by superadmin") : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", packageId);

      if (updErr) {
        return NextResponse.json(
          {
            error: isMissingColumnError(updErr, "status")
              ? "Database column public.packages.status does not exist yet. Run migration supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor."
              : updErr.message,
          },
          { status: 500 }
        );
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: `admin.package_${action}`,
        target_type: "package",
        target_name: packageId,
        metadata: { severity: action === "quarantine" ? "critical" : "info", email: ctx.user.email },
      });

      return NextResponse.json({ success: true, status: nextStatus });
    }

    if (action === "toggle_verified") {
      const nextVerified = Boolean(body.verified);
      const { error: updErr } = await adminSupabase
        .from("packages")
        .update({ verified: nextVerified, updated_at: new Date().toISOString() })
        .eq("id", packageId);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }

      await adminSupabase.from("audit_log").insert({
        actor_id: ctx.publicUserId,
        action: nextVerified ? "admin.package_verify" : "admin.package_unverify",
        target_type: "package",
        target_name: packageId,
        metadata: { severity: "info", email: ctx.user.email },
      });

      return NextResponse.json({ success: true, verified: nextVerified });
    }

    return NextResponse.json({ error: "Unsupported skill moderation action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[Admin Skills] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Moderation update failed." },
      { status: 500 }
    );
  }
}
