import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAuthorizedWorkspaceOrg } from "@/lib/workspace/org-access";
import { isMissingTableError } from "@/lib/supabase/postgrest-errors";
import { getClientIp, workspaceWriteLimiter } from "@/lib/security/rate-limit";
import { isSafePublicWebhookUrl } from "@/lib/security/sanitize";

const MIGRATION_HINT =
  "Workspace webhooks table is not created yet. Run supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor.";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(
      searchParams.get("orgId")
    );
    if (errorResponse || !access) return errorResponse!;

    const { data, error } = await access.adminSupabase
      .from("workspace_webhooks")
      .select("*")
      .eq("org_id", access.orgRow.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error, "workspace_webhooks")) {
        return NextResponse.json({ webhooks: [], migrationRequired: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const webhooks = (data || []).map((w) => ({
      id: w.id,
      url: w.url,
      events: Array.isArray(w.events) ? w.events : ["skill.published"],
      status: w.status === "Paused" ? "Paused" : "Active",
      lastStatusCode: typeof w.last_status_code === "number" ? w.last_status_code : null,
      lastTriggered: w.last_triggered_at
        ? new Date(w.last_triggered_at).toLocaleString()
        : "Never",
      secretPrefix: w.secret_prefix,
    }));

    return NextResponse.json(
      { webhooks, migrationRequired: false },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load webhooks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!workspaceWriteLimiter.check(`webhooks:${ip}`)) {
    return NextResponse.json(
      { error: "Rate limit exceeded for webhook operations." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "create");
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(
      typeof body.orgId === "string" ? body.orgId : null
    );
    if (errorResponse || !access) return errorResponse!;

    if (!access.canAdminOrg) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can manage webhooks." },
        { status: 403 }
      );
    }

    if (action === "test_ping") {
      const targetId = typeof body.webhookId === "string" ? body.webhookId.trim() : "";
      let targetUrl = typeof body.url === "string" ? body.url.trim() : "";

      if (targetId && !targetUrl) {
        const { data: whRow } = await access.adminSupabase
          .from("workspace_webhooks")
          .select("url")
          .eq("id", targetId)
          .eq("org_id", access.orgRow.id)
          .maybeSingle();
        targetUrl = whRow?.url || "";
      }

      if (!targetUrl || !isSafePublicWebhookUrl(targetUrl)) {
        return NextResponse.json(
          { error: "Webhook URL must be a valid public HTTPS endpoint." },
          { status: 400 }
        );
      }

      const payload = {
        event: "workspace.test_ping",
        timestamp: new Date().toISOString(),
        actor: access.ctx.user.email,
        workspace: access.orgRow.slug.startsWith("@")
          ? access.orgRow.slug
          : `@${access.orgRow.slug}`,
      };
      const rawBody = JSON.stringify(payload, null, 2);
      const signature = crypto
        .createHmac("sha256", process.env.SUPABASE_JWT_SECRET || "spm-webhook-test")
        .update(rawBody)
        .digest("hex");

      const startedAt = Date.now();
      let statusCode = 0;
      let responseText = "";

      try {
        const res = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Agent-SPM-Webhook/1.0",
            "X-SPM-Event": "workspace.test_ping",
            "X-SPM-Signature-256": `sha256=${signature}`,
          },
          body: rawBody,
          signal: AbortSignal.timeout(5000),
          redirect: "manual",
        });
        statusCode = res.status;
        responseText = (await res.text()).slice(0, 1000) || `HTTP ${res.status}`;
      } catch (fetchErr: unknown) {
        statusCode = 502;
        responseText = JSON.stringify({
          error:
            fetchErr instanceof Error ? fetchErr.message : "Failed to connect to webhook endpoint.",
        });
      }

      const latencyMs = Math.max(1, Date.now() - startedAt);
      const nowIso = new Date().toISOString();

      if (targetId) {
        await access.adminSupabase
          .from("workspace_webhooks")
          .update({
            last_status_code: statusCode,
            last_triggered_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", targetId)
          .eq("org_id", access.orgRow.id);
      }

      return NextResponse.json({
        success: statusCode >= 200 && statusCode < 400,
        delivery: {
          id: `del_${Date.now()}`,
          webhookId: targetId || "adhoc",
          endpointUrl: targetUrl,
          event: "workspace.test_ping",
          timestamp: nowIso,
          statusCode,
          latencyMs,
          requestBody: rawBody,
          responseBody: responseText,
        },
      });
    }

    // Create or update webhook endpoint
    const url = String(body.url || "").trim();
    const events = Array.isArray(body.events)
      ? body.events.filter((e: unknown): e is string => typeof e === "string" && e.length > 0).slice(0, 10)
      : ["skill.published"];

    if (!isSafePublicWebhookUrl(url)) {
      return NextResponse.json(
        { error: "Webhook URL must be a valid public HTTPS URL (localhost/private IPs are blocked)." },
        { status: 400 }
      );
    }

    if (action === "update" && typeof body.id === "string" && body.id.trim()) {
      const { data, error } = await access.adminSupabase
        .from("workspace_webhooks")
        .update({
          url,
          events: events.length ? events : ["skill.published"],
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id.trim())
        .eq("org_id", access.orgRow.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          {
            error: isMissingTableError(error, "workspace_webhooks")
              ? MIGRATION_HINT
              : error.message,
          },
          { status: isMissingTableError(error, "workspace_webhooks") ? 503 : 500 }
        );
      }

      return NextResponse.json({ success: true, webhook: data });
    }

    if (action === "toggle_status" && typeof body.id === "string") {
      const nextStatus = body.status === "Paused" ? "Paused" : "Active";
      const { error } = await access.adminSupabase
        .from("workspace_webhooks")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", body.id.trim())
        .eq("org_id", access.orgRow.id);

      if (error) {
        return NextResponse.json(
          {
            error: isMissingTableError(error, "workspace_webhooks")
              ? MIGRATION_HINT
              : error.message,
          },
          { status: isMissingTableError(error, "workspace_webhooks") ? 503 : 500 }
        );
      }
      return NextResponse.json({ success: true, status: nextStatus });
    }

    const secretPrefix = `whsec_${crypto.randomBytes(4).toString("hex")}`;
    const { data, error } = await access.adminSupabase
      .from("workspace_webhooks")
      .insert({
        org_id: access.orgRow.id,
        url,
        events: events.length ? events : ["skill.published"],
        status: "Active",
        secret_prefix: secretPrefix,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: isMissingTableError(error, "workspace_webhooks")
            ? MIGRATION_HINT
            : error.message,
        },
        { status: isMissingTableError(error, "workspace_webhooks") ? 503 : 500 }
      );
    }

    await access.adminSupabase.from("audit_log").insert({
      actor_id: access.ctx.publicUserId,
      action: "webhook.created",
      target_type: "webhook",
      target_name: url,
      metadata: { severity: "info", email: access.ctx.user.email, orgId: access.orgRow.id },
    });

    return NextResponse.json({ success: true, webhook: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook action failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(
      searchParams.get("orgId")
    );
    if (errorResponse || !access) return errorResponse!;

    if (!access.canAdminOrg || !id) {
      return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
    }

    const { error } = await access.adminSupabase
      .from("workspace_webhooks")
      .delete()
      .eq("id", id)
      .eq("org_id", access.orgRow.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete webhook." },
      { status: 500 }
    );
  }
}
