import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function BillingPage() {
  // In production, fetch billing data from Polar.sh API or your database
  const plan = {
    name: "Team",
    seatsUsed: 4,
    seatsTotal: 10,
    nextBilling: "May 1, 2025",
    monthlyPrice: 49,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Billing
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                {plan.name} Plan
              </h2>
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              ${plan.monthlyPrice}/month · Up to {plan.seatsTotal} seats
            </p>
          </div>
          <Link
            href="/billing/portal"
            className="inline-flex items-center gap-2 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-surface-700 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/50 dark:hover:text-brand-400"
          >
            <ExternalLink className="h-4 w-4" />
            Manage in Polar
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-900">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Users className="h-4 w-4" />
              Seats
            </div>
            <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-50">
              {plan.seatsUsed}{" "}
              <span className="text-sm font-normal text-surface-400">
                / {plan.seatsTotal}
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-900">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Calendar className="h-4 w-4" />
              Next billing
            </div>
            <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-50">
              {plan.nextBilling}
            </p>
          </div>
          <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-900">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <CreditCard className="h-4 w-4" />
              Payment
            </div>
            <p className="mt-1 text-xl font-bold text-surface-900 dark:text-surface-50">
              •••• 4242
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-800 dark:bg-surface-950">
        <h3 className="font-semibold text-surface-900 dark:text-surface-50">
          Plan Features
        </h3>
        <ul className="mt-4 space-y-3">
          {[
            "Up to 10 team seats",
            "Unlimited private packages",
            "Priority malware scanning",
            "Usage analytics dashboard",
            "Email & chat support",
            "SSO integration",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <CheckCircle className="h-4 w-4 shrink-0 text-success" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Portal CTA */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-6 dark:border-brand-800 dark:bg-brand-950/20">
        <h3 className="font-semibold text-surface-900 dark:text-surface-50">
          Need to make changes?
        </h3>
        <p className="mt-1 text-sm text-surface-500">
          Upgrade plans, update payment methods, view invoices, and assign seats
          in the Polar customer portal.
        </p>
        <Link
          href="/billing/portal"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <CreditCard className="h-4 w-4" />
          Open Customer Portal
        </Link>
      </div>
    </div>
  );
}
