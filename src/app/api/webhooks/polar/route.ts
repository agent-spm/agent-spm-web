import { NextResponse } from "next/server";
import crypto from "crypto";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logger";

const log = logger.child("PolarWebhook");
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(request: Request) {
  // Rate limiting — use forwarded IP or fallback
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (!limiter.check(clientIp)) {
    log.warn("Rate limited", { ip: clientIp });
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("webhook-signature");
  const webhookId = request.headers.get("webhook-id");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!signature || !webhookId || !webhookTimestamp) {
    log.warn("Missing webhook headers", { webhookId });
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    log.error("POLAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
  const secretBytes = Buffer.from(secret.split("_").pop()!, "base64");
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const signatures = signature.split(" ");
  const isValid = signatures.some((sig) => {
    const sigValue = sig.split(",").pop();
    return sigValue === expectedSignature;
  });

  if (!isValid) {
    log.warn("Invalid webhook signature", { webhookId });
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // Parse and handle the event
  const event = JSON.parse(body);

  switch (event.type) {
    case "subscription.created":
    case "subscription.updated":
      // TODO: Sync subscription status to your database
      log.info("Subscription event", { type: event.type, id: event.data.id });
      break;

    case "subscription.canceled":
      log.info("Subscription canceled", { id: event.data.id });
      break;

    case "order.created":
      log.info("New order", { id: event.data.id });
      break;

    default:
      log.info("Unhandled event type", { type: event.type });
  }

  return NextResponse.json({ received: true });
}
