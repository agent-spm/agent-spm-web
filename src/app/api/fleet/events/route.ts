import { NextResponse } from "next/server";
import { requireAuthorizedWorkspaceOrg } from "@/lib/workspace/org-access";
import { isMissingTableError } from "@/lib/supabase/postgrest-errors";

export interface FleetTelemetryStats {
  activeRunners: number;
  throughputPerMin: number;
  p95LatencyMs: number;
  hourlyTokenCostUsd: number;
  passRatePercent: number;
  blockedOrFailedCount: number;
  totalEvents: number;
}

function emptyStats(): FleetTelemetryStats {
  return {
    activeRunners: 0,
    throughputPerMin: 0,
    p95LatencyMs: 0,
    hourlyTokenCostUsd: 0,
    passRatePercent: 100,
    blockedOrFailedCount: 0,
    totalEvents: 0,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(
      searchParams.get("orgId")
    );
    if (errorResponse || !access) return errorResponse!;

    const { data, error } = await access.adminSupabase
      .from("agent_telemetry_events")
      .select("*")
      .eq("org_id", access.orgRow.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (isMissingTableError(error, "agent_telemetry_events")) {
        return NextResponse.json(
          {
            events: [],
            stats: emptyStats(),
            migrationRequired: true,
            orgSlug: access.orgRow.slug.startsWith("@")
              ? access.orgRow.slug
              : `@${access.orgRow.slug}`,
          },
          { headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const nowMs = Date.now();
    const fiveMinAgoMs = nowMs - 5 * 60_000;
    const oneMinAgoMs = nowMs - 60_000;
    const oneHourAgoMs = nowMs - 60 * 60_000;

    const recentRunners = new Set<string>();
    let callsLastMinute = 0;
    let tokensLastHour = 0;
    const latencies: number[] = [];
    let blockedOrFailed = 0;

    for (const r of rows) {
      const ts = r.created_at ? new Date(r.created_at).getTime() : 0;
      if (ts >= fiveMinAgoMs && r.agent_id) {
        recentRunners.add(r.agent_id);
      }
      if (ts >= oneMinAgoMs) {
        callsLastMinute++;
      }
      if (ts >= oneHourAgoMs) {
        tokensLastHour += Number(r.tokens) || 0;
      }
      if (typeof r.latency_ms === "number") {
        latencies.push(r.latency_ms);
      }
      if (Number(r.status_code) >= 400 || r.shield_status === "BLOCKED") {
        blockedOrFailed++;
      }
    }

    latencies.sort((a, b) => a - b);
    const p95Index =
      latencies.length > 0 ? Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95)) : 0;
    const p95LatencyMs = latencies.length > 0 ? latencies[p95Index] : 0;

    // Conservative $3 / 1M tokens estimate strictly from real ingested token counts
    const hourlyTokenCostUsd = Number(((tokensLastHour / 1_000_000) * 3).toFixed(4));
    const passRatePercent =
      rows.length > 0
        ? Number((((rows.length - blockedOrFailed) / rows.length) * 100).toFixed(2))
        : 100;

    const events = rows.map((r) => ({
      id: r.id,
      timestamp: r.created_at
        ? new Date(r.created_at).toISOString().split("T")[1].slice(0, 12)
        : "00:00:00.000",
      createdAt: r.created_at,
      agentId: r.agent_id,
      agentRole: r.agent_role || "Autonomous Runner",
      skillName: r.package_name || "@workspace/agent-skill",
      toolName: r.tool_name,
      method: r.method || "tools/call",
      status: Number(r.status_code) || 200,
      latencyMs: Number(r.latency_ms) || 0,
      tokens: Number(r.tokens) || 0,
      clientIp: r.client_ip || "—",
      shieldStatus: r.shield_status || "PASS",
      requestPayload: r.request_payload || {},
      responsePayload: r.response_payload || {},
    }));

    return NextResponse.json(
      {
        events,
        stats: {
          activeRunners: recentRunners.size,
          throughputPerMin: callsLastMinute,
          p95LatencyMs,
          hourlyTokenCostUsd,
          passRatePercent,
          blockedOrFailedCount: blockedOrFailed,
          totalEvents: rows.length,
        },
        migrationRequired: false,
        orgSlug: access.orgRow.slug.startsWith("@")
          ? access.orgRow.slug
          : `@${access.orgRow.slug}`,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load fleet telemetry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { access, errorResponse } = await requireAuthorizedWorkspaceOrg(
      searchParams.get("orgId")
    );
    if (errorResponse || !access) return errorResponse!;

    if (!access.canAdminOrg) {
      return NextResponse.json(
        { error: "Only workspace owners or admins can clear telemetry events." },
        { status: 403 }
      );
    }

    const { error } = await access.adminSupabase
      .from("agent_telemetry_events")
      .delete()
      .eq("org_id", access.orgRow.id);

    if (error && !isMissingTableError(error, "agent_telemetry_events")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to clear telemetry." },
      { status: 500 }
    );
  }
}
