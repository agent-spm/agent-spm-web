import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { isMissingTableError } from "@/lib/supabase/postgrest-errors";
import { getClientIp, telemetryIngestLimiter } from "@/lib/security/rate-limit";
import { requireAuthorizedWorkspaceOrg } from "@/lib/workspace/org-access";

const MIGRATION_HINT =
  "Telemetry table public.agent_telemetry_events does not exist yet. Run supabase/migrations/20261126_admin_control_plane_and_tenant_scoping.sql in Supabase SQL Editor.";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!telemetryIngestLimiter.check(`ingest:${clientIp}`)) {
    return NextResponse.json(
      { error: "Telemetry ingest rate limit exceeded (120 events/min)." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization") || "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    let adminSupabase = getSupabaseServiceClient();
    let orgId = "";
    let orgSlug = "";
    let apiKeyId: string | null = null;

    if (bearerToken) {
      if (!bearerToken.startsWith("spm_")) {
        return NextResponse.json(
          { error: "Invalid SPM API key format." },
          { status: 401 }
        );
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(bearerToken)
        .digest("hex");

      const { data: keyRow, error: keyErr } = await adminSupabase
        .from("api_keys")
        .select("id, user_id, org_id, type")
        .eq("key_hash", tokenHash)
        .maybeSingle();

      if (keyErr || !keyRow) {
        return NextResponse.json(
          { error: "Invalid or revoked API key." },
          { status: 401 }
        );
      }

      if (keyRow.type === "read-only") {
        return NextResponse.json(
          { error: "Read-only API keys cannot ingest telemetry writes. Use a live key." },
          { status: 403 }
        );
      }

      apiKeyId = keyRow.id;
      if (keyRow.org_id) {
        orgId = keyRow.org_id;
      } else if (keyRow.user_id) {
        const { data: mem } = await adminSupabase
          .from("organization_members")
          .select("org_id")
          .eq("user_id", keyRow.user_id)
          .limit(1)
          .maybeSingle();
        orgId = mem?.org_id || "";
      }

      if (!orgId) {
        return NextResponse.json(
          { error: "API key is not bound to an active organization." },
          { status: 400 }
        );
      }

      const { data: orgRow } = await adminSupabase
        .from("organizations")
        .select("slug")
        .eq("id", orgId)
        .maybeSingle();
      orgSlug = orgRow?.slug || "workspace";

      await adminSupabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyRow.id);
    } else {
      const requestedOrgId = typeof body.orgId === "string" ? body.orgId : null;
      const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(requestedOrgId);
      if (errorResponse || !access) return errorResponse!;
      adminSupabase = access.adminSupabase;
      orgId = access.orgRow.id;
      orgSlug = access.orgRow.slug;
    }

    const agentId = String(body.agentId || "agent-runner-01").trim().slice(0, 100);
    const agentRole = String(body.agentRole || "MCP Worker").trim().slice(0, 80);
    const packageName = String(
      body.packageName || body.skillName || `@${orgSlug.replace(/^@/, "")}/skill`
    )
      .trim()
      .slice(0, 120);
    const toolName = String(body.toolName || "tools/call").trim().slice(0, 100);
    const method = ["tools/call", "resources/read", "prompts/get"].includes(String(body.method))
      ? String(body.method)
      : "tools/call";
    const statusCode = Math.max(
      100,
      Math.min(599, Number(body.statusCode ?? body.status ?? 200) || 200)
    );
    const latencyMs = Math.max(0, Math.min(600_000, Math.round(Number(body.latencyMs ?? 0) || 0)));
    const tokens = Math.max(0, Math.min(10_000_000, Math.round(Number(body.tokens ?? 0) || 0)));
    const shieldStatus =
      body.shieldStatus === "BLOCKED" || body.shieldStatus === "FLAGGED"
        ? body.shieldStatus
        : statusCode >= 400
          ? "FLAGGED"
          : "PASS";

    const defaultReq = {
      jsonrpc: "2.0",
      id: `rpc_${Date.now()}`,
      method,
      params: { name: toolName, package: packageName },
    };
    const defaultRes =
      statusCode >= 400
        ? {
            jsonrpc: "2.0",
            id: defaultReq.id,
            error: { code: -32000, message: `HTTP ${statusCode} from ${toolName}` },
          }
        : {
            jsonrpc: "2.0",
            id: defaultReq.id,
            result: { ok: true, latencyMs },
          };

    const requestPayload =
      body.requestPayload && typeof body.requestPayload === "object"
        ? body.requestPayload
        : defaultReq;
    const responsePayload =
      body.responsePayload && typeof body.responsePayload === "object"
        ? body.responsePayload
        : defaultRes;

    const { data: inserted, error: insertErr } = await adminSupabase
      .from("agent_telemetry_events")
      .insert({
        org_id: orgId,
        api_key_id: apiKeyId,
        package_name: packageName,
        agent_id: agentId,
        agent_role: agentRole,
        tool_name: toolName,
        method,
        status_code: statusCode,
        latency_ms: latencyMs,
        tokens,
        client_ip: clientIp,
        shield_status: shieldStatus,
        request_payload: requestPayload,
        response_payload: responsePayload,
      })
      .select("*")
      .single();

    if (insertErr) {
      const missingTable = isMissingTableError(insertErr, "agent_telemetry_events");
      return NextResponse.json(
        {
          error: missingTable ? MIGRATION_HINT : insertErr.message,
          migrationRequired: missingTable,
        },
        { status: missingTable ? 503 : 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          id: inserted.id,
          createdAt: inserted.created_at,
          agentId: inserted.agent_id,
          toolName: inserted.tool_name,
          status: inserted.status_code,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to ingest telemetry event." },
      { status: 500 }
    );
  }
}
