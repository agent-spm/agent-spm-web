import { NextResponse } from "next/server";
import crypto from "crypto";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const DEFAULT_SUPERADMIN = "lakshitsoni26@gmail.com";
export const IMPERSONATE_COOKIE_NAME = "spm_impersonate";

export interface ImpersonationCookiePayload {
  orgId: string;
  userId?: string | null;
  orgSlug?: string;
  issuedAt: number;
  actorUid: string;
}

function getSigningSecret(): string {
  return (
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_JWT_SECRET ||
    ""
  );
}

/**
 * Signs a short-lived superadmin impersonation payload into an HMAC-verified token.
 */
export function signImpersonationPayload(payload: ImpersonationCookiePayload): string {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error("Missing server signing secret for impersonation.");
  }
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

/**
 * Verifies an HMAC-signed impersonation cookie and ensures it belongs to the active superadmin.
 */
export function verifyImpersonationCookie(
  rawCookie: string | undefined,
  actorUid: string
): ImpersonationCookiePayload | null {
  if (!rawCookie || !actorUid) return null;
  const secret = getSigningSecret();
  if (!secret) return null;

  const dotIdx = rawCookie.indexOf(".");
  if (dotIdx <= 0) return null;

  const encoded = rawCookie.slice(0, dotIdx);
  const sig = rawCookie.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  const bufA = Buffer.from(sig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ImpersonationCookiePayload;
    if (!parsed?.orgId || parsed.actorUid !== actorUid) return null;
    // Expire impersonation cleanly after 12 hours
    if (Date.now() - Number(parsed.issuedAt || 0) > 12 * 60 * 60 * 1000) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

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
  let dbStatus: string | null = null;

  const { data: byUid } = await adminSupabase
    .from("users")
    .select("*")
    .eq("supabase_uid", user.id)
    .maybeSingle();

  if (byUid) {
    publicUserId = byUid.id;
    dbRole = byUid.role;
    dbStatus = typeof byUid.status === "string" ? byUid.status : null;
  } else {
    const { data: byEmail } = await adminSupabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (byEmail) {
      publicUserId = byEmail.id;
      dbRole = byEmail.role;
      dbStatus = typeof byEmail.status === "string" ? byEmail.status : null;
      if (!byEmail.supabase_uid) {
        await adminSupabase
          .from("users")
          .update({ supabase_uid: user.id })
          .eq("id", byEmail.id);
      }
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
        .select("*")
        .single();

      if (created) {
        publicUserId = created.id;
        dbRole = created.role;
        dbStatus = typeof created.status === "string" ? created.status : null;
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

  const superAdminFlag = dbRole === "superadmin" || isSuperAdminEmail(cleanEmail);
  if (!superAdminFlag && dbStatus === "suspended") {
    return {
      ctx: null,
      errorResponse: NextResponse.json(
        { error: "This account has been suspended by a platform administrator." },
        { status: 403 }
      ),
    };
  }

  const githubIdentity = user.identities?.find((i) => i.provider === "github");
  const identityData =
    (githubIdentity?.identity_data as Record<string, unknown> | undefined) ?? undefined;
  const providerIdFromData =
    typeof identityData?.provider_id === "string" || typeof identityData?.provider_id === "number"
      ? String(identityData.provider_id)
      : undefined;
  const githubId =
    providerIdFromData ||
    (githubIdentity?.id ? String(githubIdentity.id) : undefined) ||
    (user.user_metadata?.provider_id ? String(user.user_metadata.provider_id) : undefined);

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
      isSuperAdmin: superAdminFlag,
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
