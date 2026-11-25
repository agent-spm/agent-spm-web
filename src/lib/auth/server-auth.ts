import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const DEFAULT_SUPERADMIN = "lakshitsoni26@gmail.com";

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const configured = (process.env.SUPERADMIN_EMAILS || DEFAULT_SUPERADMIN)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

export interface AuthenticatedContext {
  user: User;
  publicUserId: string;
  isSuperAdmin: boolean;
  githubId?: string;
  githubHandle?: string;
}

/**
 * Verifies the active Supabase Auth session and resolves the matching `public.users` record.
 * Never trusts client-provided user IDs or cookies.
 */
export async function requireAuthenticatedUser(): Promise<
  | { ctx: AuthenticatedContext; errorResponse: null }
  | { ctx: null; errorResponse: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return {
      ctx: null,
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please sign in first." },
        { status: 401 }
      ),
    };
  }

  const adminSupabase = getSupabaseServiceClient();
  const cleanEmail = user.email.toLowerCase().trim();

  // Resolve matching public.users row by supabase_uid, falling back to email
  let publicUserId: string | null = null;
  let dbRole: string | null = null;

  const { data: byUid } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("supabase_uid", user.id)
    .maybeSingle();

  if (byUid) {
    publicUserId = byUid.id;
    dbRole = byUid.role;
  } else {
    const { data: byEmail } = await adminSupabase
      .from("users")
      .select("id, role")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (byEmail) {
      publicUserId = byEmail.id;
      dbRole = byEmail.role;
    } else {
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.user_name ||
        cleanEmail.split("@")[0];
      const superAdmin = isSuperAdminEmail(cleanEmail);

      const { data: created } = await adminSupabase
        .from("users")
        .insert({
          supabase_uid: user.id,
          email: cleanEmail,
          display_name: displayName,
          role: superAdmin ? "superadmin" : "user",
        })
        .select("id, role")
        .single();

      if (created) {
        publicUserId = created.id;
        dbRole = created.role;
      }
    }
  }

  if (!publicUserId) {
    return {
      ctx: null,
      errorResponse: NextResponse.json(
        { error: "Failed to resolve authenticated user profile." },
        { status: 500 }
      ),
    };
  }

  const githubIdentity = user.identities?.find((i) => i.provider === "github");
  const githubId = githubIdentity?.id ? String(githubIdentity.id) : undefined;

  const identityData =
    (githubIdentity?.identity_data as Record<string, unknown> | undefined) ?? undefined;
  const githubHandle =
    typeof identityData?.user_name === "string"
      ? identityData.user_name
      : typeof identityData?.preferred_username === "string"
        ? identityData.preferred_username
        : undefined;

  return {
    ctx: {
      user,
      publicUserId,
      isSuperAdmin: dbRole === "superadmin" || isSuperAdminEmail(cleanEmail),
      githubId,
      githubHandle,
    },
    errorResponse: null,
  };
}

/**
 * Paginates GoTrue admin users lookup to locate an existing user by email without
 * hitting the default 50-user single-page limit.
 */
export async function findAuthUserByEmail(
  adminSupabase: ReturnType<typeof getSupabaseServiceClient>,
  targetEmail: string
): Promise<User | null> {
  const normalized = targetEmail.toLowerCase().trim();
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data?.users?.length) break;
    const match = data.users.find(
      (u) => u.email?.toLowerCase().trim() === normalized
    );
    if (match) return match;
    if (data.users.length < perPage) break;
  }
  return null;
}
