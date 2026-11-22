import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSuperAdminEmail } from "@/lib/auth/server-auth";
import { getTrustedOrigin } from "@/lib/security/sanitize";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectBase = getTrustedOrigin(request);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? searchParams.get("redirect") ?? "/app";

  // Prevent open redirect vulnerabilities: ensure next is a valid relative path
  let next = rawNext;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    next = "/app";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const isLocalEnv = process.env.NODE_ENV === "development";

      const user = data.session.user;
      const email = user.email?.toLowerCase().trim() || "";
      const isSuperAdmin = isSuperAdminEmail(email);
      const targetDestination = isSuperAdmin && next === "/app" ? "/admin" : next;

      const response = NextResponse.redirect(`${redirectBase}${targetDestination}`);

      // 1. Persist GitHub OAuth token if returned by provider
      if (data.session.provider_token) {
        response.cookies.set("spm_gh_token", data.session.provider_token, {
          httpOnly: true,
          secure: !isLocalEnv,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      // 2. Set persona cookie based on identity
      response.cookies.set("spm_persona", isSuperAdmin ? "superadmin" : "owner", {
        path: "/",
        sameSite: "lax",
        secure: !isLocalEnv,
        maxAge: 60 * 60 * 24 * 7,
      });

      // 3. Idempotently provision public.users and developer namespace in public.organizations
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey && user) {
        try {
          const adminSupabase = createClient(supabaseUrl, serviceKey);

          const githubIdentity = user.identities?.find((i) => i.provider === "github");
          const identityData =
            (githubIdentity?.identity_data as Record<string, unknown> | undefined) ?? undefined;
          const githubHandle =
            (typeof identityData?.user_name === "string" ? identityData.user_name : undefined) ||
            (typeof identityData?.preferred_username === "string"
              ? identityData.preferred_username
              : undefined) ||
            user.user_metadata?.user_name ||
            user.user_metadata?.preferred_username ||
            email.split("@")[0] ||
            "developer";

          const displayName =
            (typeof identityData?.full_name === "string" ? identityData.full_name : undefined) ||
            user.user_metadata?.full_name ||
            githubHandle;

          // A. Provision public.users
          let publicUserId: string | null = null;
          const { data: existingPubUser } = await adminSupabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

          if (existingPubUser) {
            publicUserId = existingPubUser.id;
          } else {
            const { data: newPubUser, error: pubInsertError } = await adminSupabase
              .from("users")
              .insert({
                supabase_uid: user.id,
                email,
                display_name: displayName,
                role: isSuperAdmin ? "superadmin" : "user",
              })
              .select("id")
              .single();

            if (pubInsertError || !newPubUser) {
              console.warn("[Auth Callback] public.users insert warning:", pubInsertError);
            } else {
              publicUserId = newPubUser.id;
            }
          }

          // B. Provision developer personal organization namespace (@handle) safely
          const cleanSlug = githubHandle.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "");
          if (cleanSlug && publicUserId) {
            const { data: existingOrg } = await adminSupabase
              .from("organizations")
              .select("id")
              .eq("slug", cleanSlug)
              .maybeSingle();

            let orgId = existingOrg?.id;
            if (!orgId) {
              const { data: newOrg, error: orgError } = await adminSupabase
                .from("organizations")
                .insert({
                  name: `${githubHandle}'s Workspace`,
                  slug: cleanSlug,
                  plan: isSuperAdmin ? "pro" : "free",
                  seats_allowed: isSuperAdmin ? 100 : 3,
                })
                .select("id")
                .single();

              if (!orgError && newOrg) {
                orgId = newOrg.id;
              }
            }

            if (orgId) {
              await adminSupabase.from("organization_members").upsert(
                {
                  org_id: orgId,
                  user_id: publicUserId,
                  role: "owner",
                },
                { onConflict: "org_id,user_id" }
              );
            }
          }
        } catch (dbErr) {
          console.error("[Auth Callback] DB provisioning exception:", dbErr);
        }
      }

      return response;
    }
    console.error("[Auth Callback] exchangeCodeForSession error:", error);
  }

  // Redirect to login with error indicator on failure
  return NextResponse.redirect(`${redirectBase}/login?error=auth_exchange_failed`);
}
