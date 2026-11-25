import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authApiLimiter, getClientIp } from "@/lib/security/rate-limit";
import { getTrustedOrigin, sanitizeIdentifier } from "@/lib/security/sanitize";

const VALID_DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;

/**
 * Enterprise SAML 2.0 / OIDC SSO Authentication Initiation
 *
 * Security Model:
 * 1. Rate-limits SSO lookup requests by IP.
 * 2. Strictly sanitizes organization domain/slug before DB lookup (no raw filter interpolation).
 * 3. Initiates cryptographic SP-initiated SAML flow via Supabase Auth (or returns 400 if unconfigured).
 * 4. STRICT RULE: NEVER mint tokens, auto-authenticate, or bypass IdP challenge.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!authApiLimiter.check(`sso:${ip}`)) {
      return NextResponse.json(
        { error: "Too many SSO requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { domain } = body;

    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return NextResponse.json(
        { error: "Company or organization domain is required (e.g. acme-corp.com)" },
        { status: 400 }
      );
    }

    const cleanDomain = sanitizeIdentifier(domain);
    if (!cleanDomain || cleanDomain.length > 253 || !VALID_DOMAIN_REGEX.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Please enter a valid organization domain or slug (letters, numbers, dots, and hyphens only)." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server authentication configuration is incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { getSupabaseServiceClient } = await import("@/lib/supabase/service");
    const adminSupabase = getSupabaseServiceClient();

    // 1. Parameterized lookup by slug via service role (safe under strict tenant RLS on organizations)
    const { data: org } = await adminSupabase
      .from("organizations")
      .select("id, name, slug, plan")
      .eq("slug", cleanDomain)
      .maybeSingle();

    // 2. Attempt SP-Initiated SAML SSO with Supabase Auth using trusted origin
    const trustedOrigin = getTrustedOrigin(request);
    const callbackUrl = `${trustedOrigin}/auth/callback?next=/app`;

    try {
      const { data: ssoData, error: ssoError } = await supabase.auth.signInWithSSO({
        domain: cleanDomain,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (!ssoError && ssoData?.url) {
        return NextResponse.json({
          success: true,
          url: ssoData.url,
        });
      }
    } catch {
      // SAML provider lookup failed -> fall through cleanly
    }

    return NextResponse.json(
      {
        error: org
          ? `SAML SSO is not yet provisioned for '${org.name}'. Please sign in with your email verification code (OTP) or contact your IT administrator to configure enterprise SSO.`
          : `No enterprise SAML SSO connection found for '${cleanDomain}'. Please sign in with your email verification code (OTP) or verify your corporate domain.`,
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "SSO initiation failed" },
      { status: 500 }
    );
  }
}
