import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client with the Service Role key to bypass RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
}

export function getSupabaseServiceClient() {
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


/**
 * Provisions a paid Pro subscription entitlement (via Razorpay) for the given email address.
 * Auto-creates the user record in the `users` table if they do not exist.
 */
export async function provisionProSubscription(email: string, subscriptionId: string) {
  const supabase = getSupabaseServiceClient();

  // 1. Check if user already exists
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (findError) {
    console.error("Error finding user:", findError);
    throw new Error(`Failed to verify user status: ${findError.message}`);
  }

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Generate a random UUID for the mock Supabase UID
    const tempSupabaseUid = crypto.randomUUID();
    const displayName = email.split("@")[0];

    // Auto-create user record
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        supabase_uid: tempSupabaseUid,
        email: email,
        display_name: displayName,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      throw new Error(`Failed to auto-create user profile: ${insertError.message}`);
    }

    userId = newUser.id;
  }

  // 2. Upsert subscription entitlement (Idempotent using polar_subscription_id)
  const { error: upsertError } = await supabase
    .from("entitlements")
    .upsert(
      {
        user_id: userId,
        polar_subscription_id: subscriptionId,
        seats: 100, // Grant 100 active seats for Pro
        plan: "Pro (Razorpay)",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "polar_subscription_id" }
    );

  if (upsertError) {
    console.error("Error upserting entitlement:", upsertError);
    throw new Error(`Failed to provision subscription entitlement: ${upsertError.message}`);
  }

  return { success: true, userId, subscriptionId };
}
