import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { provisionProSubscription } from "@/lib/supabase/service";
import { requireAuthenticatedUser } from "@/lib/auth/server-auth";
import { checkoutApiLimiter, getClientIp } from "@/lib/security/rate-limit";
import { resolvePlanSpec } from "@/lib/billing/plans";

function constantTimeEqualHex(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  const bufA = Buffer.from(a.toLowerCase(), "hex");
  const bufB = Buffer.from(b.toLowerCase(), "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkoutApiLimiter.check(`verify:${ip}`)) {
      return NextResponse.json(
        { error: "Too many payment verification attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const { ctx, errorResponse } = await requireAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const isDevPlaceholder =
      process.env.NODE_ENV === "development" &&
      (keySecret.includes("placeholder") || !keySecret);

    const body = await request.json().catch(() => ({}));
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification fields." },
        { status: 400 }
      );
    }

    let resolvedPlanName =
      typeof planId === "string" && planId.toLowerCase().includes("enterprise")
        ? "Enterprise (Razorpay)"
        : "Pro (Razorpay)";

    if (!isDevPlaceholder) {
      if (!keySecret || !keyId || keySecret.includes("placeholder")) {
        return NextResponse.json(
          { error: "Payment verification unavailable: missing gateway credentials." },
          { status: 503 }
        );
      }

      const orderId = String(razorpay_order_id).trim();
      const paymentId = String(razorpay_payment_id).trim();
      const signature = String(razorpay_signature).trim();

      if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
        return NextResponse.json(
          { error: "Malformed Razorpay transaction identifier." },
          { status: 400 }
        );
      }

      // 1. Constant-time HMAC-SHA256 verification (no mock_ bypass!)
      const payload = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(payload)
        .digest("hex");

      if (!constantTimeEqualHex(expectedSignature, signature)) {
        return NextResponse.json(
          { error: "Payment verification failed. Cryptographic signature mismatch." },
          { status: 400 }
        );
      }

      // 2. Fetch authoritative order status and ownership from Razorpay API
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.fetch(orderId);

      if (
        !order ||
        order.status !== "paid" ||
        order.amount_due !== 0 ||
        Number(order.amount_paid) < Number(order.amount)
      ) {
        return NextResponse.json(
          { error: "Order has not been fully paid according to payment provider." },
          { status: 400 }
        );
      }

      // 3. Fail-closed ownership binding via server-created order notes
      const orderUserId = typeof order.notes?.userId === "string" ? order.notes.userId : "";
      const orderEmail =
        typeof order.notes?.email === "string" ? order.notes.email.toLowerCase().trim() : "";

      if (orderUserId !== ctx.publicUserId || orderEmail !== ctx.user.email!.toLowerCase()) {
        return NextResponse.json(
          { error: "Payment order does not belong to the authenticated user." },
          { status: 403 }
        );
      }

      // 4. Authoritative plan & amount/currency parity check from order.notes.planId
      const verifiedPlan = resolvePlanSpec(order.notes?.planId);
      if (
        !verifiedPlan ||
        Number(order.amount) !== verifiedPlan.amount ||
        order.currency !== verifiedPlan.currency
      ) {
        return NextResponse.json(
          { error: "Order plan amount or currency integrity mismatch." },
          { status: 400 }
        );
      }

      resolvedPlanName = `${verifiedPlan.label} (Razorpay)`;
    }

    // Provision entitlement exclusively for the authenticated user's verified email
    const result = await provisionProSubscription(
      ctx.user.email!,
      String(razorpay_order_id),
      resolvedPlanName
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Razorpay verification handler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify signature and activate entitlement." },
      { status: 500 }
    );
  }
}
