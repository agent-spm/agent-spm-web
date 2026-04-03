import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature");
  const webhookId = request.headers.get("webhook-id");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!signature || !webhookId || !webhookTimestamp) {
    return NextResponse.json(
      { error: "Missing webhook headers" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
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
      console.log(`[Polar Webhook] ${event.type}`, event.data.id);
      break;

    case "subscription.canceled":
      console.log(`[Polar Webhook] Subscription canceled`, event.data.id);
      break;

    case "order.created":
      console.log(`[Polar Webhook] New order`, event.data.id);
      break;

    default:
      console.log(`[Polar Webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
