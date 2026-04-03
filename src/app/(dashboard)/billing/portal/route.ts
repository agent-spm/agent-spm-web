import { CustomerPortal } from "@polar-sh/nextjs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async () => {
    // Resolve the Polar customer ID from the authenticated Supabase user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // The Polar customer ID should be stored in the user's metadata
    // or in a separate mapping table. For now, use email as lookup.
    // TODO: Replace with actual Polar customer ID lookup from your database
    const polarCustomerId = user.user_metadata?.polar_customer_id;

    if (!polarCustomerId) {
      throw new Error(
        "No Polar customer ID found. Please contact support."
      );
    }

    return polarCustomerId;
  },
  server: "sandbox", // Switch to "production" for live
});
