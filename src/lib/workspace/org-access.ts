import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  IMPERSONATE_COOKIE_NAME,
  requireAuthenticatedUser,
  verifyImpersonationCookie,
  type AuthenticatedContext,
} from "@/lib/auth/server-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export interface AuthorizedOrgContext {
  ctx: AuthenticatedContext;
  adminSupabase: ReturnType<typeof getSupabaseServiceClient>;
  effectivePublicUserId: string;
  orgRow: { id: string; slug: string; name: string };
  memberRole: string | null;
  canAdminOrg: boolean;
  isImpersonating: boolean;
}

/**
 * Resolves and authorizes access to a target organization for session-authenticated
 * workspace routes (`/api/fleet/*`, `/api/workspace/*`, UI test telemetry).
 * Enforces organization membership or superadmin / verified impersonation privileges.
 */
export async function requireAuthorizedWorkspaceOrg(
  requestedOrgId?: string | null
): Promise<
  | { access: AuthorizedOrgContext; errorResponse: null }
  | { access: null; errorResponse: NextResponse }
> {
  const { ctx, errorResponse } = await requireAuthenticatedUser();
  if (errorResponse || !ctx) {
    return {
      access: null,
      errorResponse:
        errorResponse ||
        NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const adminSupabase = getSupabaseServiceClient();
  const cookieStore = await cookies();
  const rawImpCookie = cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value;
  const activeImpersonation = ctx.isSuperAdmin
    ? verifyImpersonationCookie(rawImpCookie, ctx.user.id)
    : null;

  const effectivePublicUserId = activeImpersonation?.userId || ctx.publicUserId;

  let targetOrgId = (requestedOrgId || "").trim();
  if (activeImpersonation?.orgId) {
    targetOrgId = activeImpersonation.orgId;
  }

  let orgRow: { id: string; slug: string; name: string } | null = null;
  if (targetOrgId) {
    const { data } = await adminSupabase
      .from("organizations")
      .select("id, slug, name")
      .eq("id", targetOrgId)
      .maybeSingle();
    orgRow = data || null;
  } else {
    const { data: mem } = await adminSupabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", effectivePublicUserId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (mem?.org_id) {
      const { data } = await adminSupabase
        .from("organizations")
        .select("id, slug, name")
        .eq("id", mem.org_id)
        .maybeSingle();
      orgRow = data || null;
    }
  }

  if (!orgRow) {
    return {
      access: null,
      errorResponse: NextResponse.json(
        { error: "Target workspace organization not found." },
        { status: 404 }
      ),
    };
  }

  const { data: membership } = await adminSupabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgRow.id)
    .eq("user_id", effectivePublicUserId)
    .maybeSingle();

  const isImpersonatedOrg = Boolean(
    activeImpersonation && activeImpersonation.orgId === orgRow.id
  );
  const canAccess = Boolean(membership) || ctx.isSuperAdmin || isImpersonatedOrg;

  if (!canAccess) {
    return {
      access: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace." },
        { status: 403 }
      ),
    };
  }

  const memberRole = membership?.role || (ctx.isSuperAdmin ? "superadmin" : null);
  const canAdminOrg =
    Boolean(ctx.isSuperAdmin) ||
    memberRole === "owner" ||
    memberRole === "admin";

  return {
    access: {
      ctx,
      adminSupabase,
      effectivePublicUserId,
      orgRow,
      memberRole,
      canAdminOrg,
      isImpersonating: isImpersonatedOrg,
    },
    errorResponse: null,
  };
}
