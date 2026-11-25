import { NextResponse } from "next/server";
import { requireAuthenticatedUser, type AuthenticatedContext } from "@/lib/auth/server-auth";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export type AdminGuardResult =
  | {
      ctx: AuthenticatedContext;
      adminSupabase: ReturnType<typeof getSupabaseServiceClient>;
      errorResponse: null;
    }
  | {
      ctx: null;
      adminSupabase: null;
      errorResponse: NextResponse;
    };

/**
 * Verifies the caller has an active authenticated session with superadmin privileges.
 * Uses Supabase service-role client only after verifying server-side JWT & superadmin identity.
 */
export async function requireSuperAdmin(): Promise<AdminGuardResult> {
  const { ctx, errorResponse } = await requireAuthenticatedUser();
  if (errorResponse || !ctx) {
    return {
      ctx: null,
      adminSupabase: null,
      errorResponse:
        errorResponse ||
        NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  if (!ctx.isSuperAdmin) {
    return {
      ctx: null,
      adminSupabase: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Super-Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return {
    ctx,
    adminSupabase: getSupabaseServiceClient(),
    errorResponse: null,
  };
}

/**
 * Maps Supabase Auth users into a quick lookup of email/supabase_uid/displayName/githubId.
 */
export async function buildAuthIdentityLookup(
  adminSupabase: ReturnType<typeof getSupabaseServiceClient>
) {
  const githubIdByUid = new Map<string, string>();
  const uidByGithubId = new Map<string, string>();
  const handleByUid = new Map<string, string>();

  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data?.users?.length) break;

    for (const authUser of data.users) {
      const gh = authUser.identities?.find((i) => i.provider === "github");
      const providerId =
        gh?.identity_data && typeof gh.identity_data === "object" && "provider_id" in gh.identity_data
          ? String(gh.identity_data.provider_id || "")
          : gh?.id
            ? String(gh.id)
            : "";

      const ghNumericId =
        providerId ||
        (authUser.user_metadata?.provider_id ? String(authUser.user_metadata.provider_id) : "");

      if (ghNumericId) {
        githubIdByUid.set(authUser.id, ghNumericId);
        uidByGithubId.set(ghNumericId, authUser.id);
      }

      const idData = gh?.identity_data as Record<string, unknown> | undefined;
      const ghHandle =
        (typeof idData?.user_name === "string" && idData.user_name) ||
        (typeof idData?.preferred_username === "string" && idData.preferred_username) ||
        (typeof authUser.user_metadata?.user_name === "string" && authUser.user_metadata.user_name) ||
        "";

      if (ghHandle) {
        handleByUid.set(authUser.id, ghHandle);
      }
    }

    if (data.users.length < perPage) break;
  }

  return { githubIdByUid, uidByGithubId, handleByUid };
}
