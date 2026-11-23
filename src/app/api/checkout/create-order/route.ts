import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAuthenticatedUser } from "@/lib/auth/server-auth";
import { checkoutApiLimiter, getClientIp } from "@/lib/security/rate-limit";
import { resolvePlanSpec } from "@/lib/billing/plans";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkoutApiLimiter.check(`order:${ip}`)) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { ctx, errorResponse } = await requireAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const isPlaceholder =
      !keyId ||
      !keySecret ||
      keyId.includes("placeholder") ||
      keySecret.includes("placeholder");

    if (isPlaceholder && process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawPlanKey = String(body.planId || body.billingInterval || "monthly")
      .toLowerCase()
      .trim();

    const plan = resolvePlanSpec(rawPlanKey);
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid subscription plan specified: ${rawPlanKey}` },
        { status: 400 }
      );
    }

    const userEmail = ctx.user.email!.toLowerCase().trim();

    if (isPlaceholder) {
      // Development placeholder mode only
      const devOrderId = `order_dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return NextResponse.json({
        order_id: devOrderId,
        amount: plan.amount,
        currency: plan.currency,
        key_id: keyId || "rzp_test_placeholder",
        is_test: true,
        plan_id: rawPlanKey,
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Failed to initialize payment gateway." },
        { status: 500 }
      );
    }

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `rcpt_${rawPlanKey}_${Date.now()}`,
      notes: {
        email: userEmail,
        userId: ctx.publicUserId,
        authUid: ctx.user.id,
        planId: rawPlanKey,
        planLabel: plan.label,
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount as number,
      currency: order.currency,
      key_id: keyId,
      is_test: false,
      plan_id: rawPlanKey,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation handler error:", error);

    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Please verify API key setup." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate Razorpay checkout order." },
      { status: 500 }
    );
  }
}
