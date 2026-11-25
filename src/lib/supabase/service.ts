import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client with the Service Role key to bypass RLS policies
export function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Provisions a verified paid subscription entitlement (via Razorpay) for an existing authenticated user.
 */
export async function provisionProSubscription(
  email: string,
  subscriptionId: string,
  planName = "Pro (Razorpay)"
) {
  const supabase = getSupabaseServiceClient();
  const cleanEmail = email.toLowerCase().trim();

  // Resolve existing authenticated user record (never fabricate arbitrary unverified users)
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (findError) {
    console.error("Error finding user:", findError);
    throw new Error(`Failed to verify user status: ${findError.message}`);
  }

  if (!existingUser) {
    throw new Error("Authenticated user profile not found. Please complete sign-in before upgrading.");
  }

  const userId = existingUser.id;
  const isEnterprise = planName.toLowerCase().includes("enterprise");
  const targetOrgPlan = isEnterprise ? "enterprise" : "pro";
  const targetSeatsAllowed = isEnterprise ? 500 : 100;

  // Upsert subscription entitlement (Idempotent on polar_subscription_id / order_id)
  const { error: upsertError } = await supabase
    .from("entitlements")
    .upsert(
      {
        user_id: userId,
        polar_subscription_id: subscriptionId,
        seats: targetSeatsAllowed,
        plan: planName,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "polar_subscription_id" }
    );

  if (upsertError) {
    console.error("Error upserting entitlement:", upsertError);
    throw new Error(`Failed to provision subscription entitlement: ${upsertError.message}`);
  }

  // Synchronize owned organization plan & seat quota in public.organizations
  const { data: ownedMemberships } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("role", "owner");

  const ownedOrgIds = (ownedMemberships || [])
    .map((m) => m.org_id)
    .filter((id): id is string => Boolean(id));

  if (ownedOrgIds.length > 0) {
    const { error: orgUpdateError } = await supabase
      .from("organizations")
      .update({
        plan: targetOrgPlan,
        seats_allowed: targetSeatsAllowed,
      })
      .in("id", ownedOrgIds);

    if (orgUpdateError) {
      console.warn("Organization plan sync warning:", orgUpdateError.message);
    }
  }

  return {
    success: true,
    userId,
    subscriptionId,
    plan: planName,
    orgPlan: targetOrgPlan,
    seatsAllowed: targetSeatsAllowed,
  };
}
