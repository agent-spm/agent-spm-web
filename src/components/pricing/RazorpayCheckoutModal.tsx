"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import SPMLoader from "@/components/shared/SPMLoader";

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingInterval: "monthly" | "yearly";
}

// Function to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function RazorpayCheckoutModal({ isOpen, onClose, billingInterval }: RazorpayCheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate pricing amount in paise (₹1,900 for monthly, ₹15,000 for yearly)
  const amountInPaise = billingInterval === "yearly" ? 1500000 : 190000;
  const planDisplay = billingInterval === "yearly" ? "₹15,000 / year" : "₹1,900 / month";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid developer email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Call order creation API
      const orderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          email: trimmedEmail,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to initiate payment transaction.");
      }

      // 3. Launch Razorpay Standard Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Agent SPM",
        description: `Pro Plan - ${billingInterval === "yearly" ? "Annual" : "Monthly"}`,
        order_id: orderData.order_id,
        prefill: {
          email: trimmedEmail,
        },
        theme: {
          color: "#1B5FED",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment was cancelled. You can retry whenever you are ready.");
          },
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 4. Verify payment on server
            const verifyResponse = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                email: trimmedEmail,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }

            setSuccess(true);
          } catch (err: any) {
            setError(err.message || "Failed to verify transaction signature.");
          } finally {
            setLoading(false);
          }
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment transaction failed.");
        setLoading(false);
      });

      paymentObject.open();
    } catch (err: any) {
      setError(err.message || "An unexpected checkout error occurred.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Solid flat overlay with slight blur) */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-[4px] transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      />

      {/* Modal Card: Styled to match the Leaderboard/Console card layout perfectly */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[4px] border-2 border-[#E3E2DF] bg-[#EFEDE9] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] transition-all duration-300 z-10 text-black animate-[scaleInFade_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#EFEDE9]/95 z-20 flex flex-col items-center justify-center p-6 space-y-4">
            <SPMLoader size={110} color="#1B5FED" />
            <span className="font-mono text-xs text-black/60 uppercase tracking-widest animate-pulse">
              Preparing Checkout...
            </span>
          </div>
        )}

        {/* Close Button: Styled as monospace [X] */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 font-mono text-xs text-black/50 hover:text-black transition-colors duration-150"
          aria-label="Close modal"
        >
          [X]
        </button>

        {/* Content Flow */}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header section with technical developer style */}
            <div className="space-y-2">
              <div className="mono text-xs text-[#1B5FED]">
                [UPGRADE PLAN]
              </div>
              <h3 className="mono text-xl sm:text-2xl font-normal text-black leading-tight tracking-tight">
                UPGRADE TO PRO
              </h3>
              <p className="text-sm text-black/60 leading-relaxed font-sans font-light">
                Unlock 100 private package seats, advanced analytics, and custom namespaces.
                Plan cost: <strong className="text-black font-semibold">{planDisplay}</strong>.
              </p>
            </div>

            {/* Email Input Field - Styled to match search input in Leaderboard */}
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="text-[12px] font-medium mono text-black/40 block"
              >
                DEVELOPER EMAIL ADDRESS *
              </label>
              
              <div className="relative flex items-center bg-[#F5F5F2] border border-[#E2E0E6] rounded-[4px] focus-within:border-[#1B5FED]/40 transition-all duration-200">
                <span className="absolute left-3.5 font-mono text-sm text-black/30 select-none">$</span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-transparent pl-8 pr-4 py-3 text-sm font-mono text-black placeholder:text-black/30 focus:outline-none"
                />
              </div>
              
              <span className="block text-[11px] text-black/45 leading-relaxed font-sans font-light">
                * Must match the email you use to run <code className="font-mono bg-black/5 px-1 py-0.5 rounded text-[10px]">spm login</code> in your terminal.
              </span>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="p-3.5 rounded-[4px] border border-red-200/60 bg-red-50 text-xs font-mono text-red-650 leading-relaxed uppercase">
                ERROR: {error}
              </div>
            )}

            {/* CTA Trigger Button - Styled as bracket button with brand background */}
            <button
              type="submit"
              disabled={loading}
              className="bracket-btn active w-full py-3 px-4 flex items-center justify-center gap-2 rounded-[2px] text-base font-semibold mono uppercase disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>PREPARING PAYMENTS...</span>
                </>
              ) : (
                <>
                  <span>PROCEED TO PAYMENT</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Celebration / Success Screen */
          <div className="flex flex-col items-center text-center py-2 space-y-5 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Success Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            {/* Success Heading */}
            <div className="space-y-2">
              <h3 className="mono text-xl sm:text-2xl font-normal text-black leading-tight tracking-tight">
                PRO PLAN INSTALLED!
              </h3>
              <p className="text-sm text-black/60 leading-relaxed font-sans font-light max-w-sm">
                We have verified your transaction and provisioned <strong className="text-black font-semibold">100 Pro Seats</strong> for <strong className="text-black font-semibold">{email}</strong>.
              </p>
            </div>

            {/* Code Box for spm login */}
            <div className="w-full p-4 rounded-[4px] border border-[#E2E0E6] bg-[#F5F5F2] font-mono text-xs text-black text-left select-all shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-black/45 font-bold mb-2 font-sans select-none">
                Authenticate CLI
              </div>
              <div>
                <span className="text-[#1B5FED] font-bold select-none">$</span> spm login
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={handleClose}
              className="bracket-btn w-full py-3 px-4 flex items-center justify-center rounded-[2px] text-base font-semibold mono uppercase"
            >
              DONE
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
