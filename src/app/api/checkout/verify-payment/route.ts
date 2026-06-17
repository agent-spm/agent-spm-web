import { NextResponse } from "next/server";
import crypto from "crypto";
import { provisionProSubscription } from "@/lib/supabase/service";

const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, email } = body;

    // Validate inputs
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !email) {
      return NextResponse.json(
        { error: "Missing required verification fields." },
        { status: 400 }
      );
    }

    if (!keySecret) {
      throw new Error("Missing Razorpay API key secret on server.");
    }

    // Generate HMAC-SHA256 signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Provision Pro subscription entitlement in Supabase
    const result = await provisionProSubscription(email.trim().toLowerCase(), razorpay_order_id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Razorpay verification handler error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify signature and activate entitlement." },
      { status: 500 }
    );
  }
}
