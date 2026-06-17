import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay SDK on the server using keys
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Missing Razorpay API credentials in environment variables.");
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, email } = body;

    // Validate email presence and format
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required to create a checkout order." },
        { status: 400 }
      );
    }

    // Validate amount (Must be >= 100 paise)
    const parseAmount = Number(amount);
    if (isNaN(parseAmount) || parseAmount < 100) {
      return NextResponse.json(
        { error: "Amount must be a valid integer greater than or equal to 100 paise." },
        { status: 400 }
      );
    }

    // Create Razorpay Order
    const options = {
      amount: Math.round(parseAmount),
      currency: currency || "INR",
      receipt: `rcpt_pro_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      notes: {
        email: email,
        plan: "Pro Subscription",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay order creation handler error:", error);

    // Handle Auth failure specifically
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Please verify API key setup." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to initiate Razorpay checkout order." },
      { status: 500 }
    );
  }
}
