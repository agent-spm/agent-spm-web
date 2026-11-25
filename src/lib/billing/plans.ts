import "server-only";

export type PlanKey =
  | "monthly"
  | "yearly"
  | "pro"
  | "enterprise"
  | "enterprise_lifetime";

export interface PlanSpec {
  id: PlanKey;
  amount: number; // integer subunits (paise for INR, cents for USD)
  currency: "INR" | "USD";
  label: string;
  seats: number;
}

export const PLAN_CATALOG: Record<PlanKey, PlanSpec> = {
  monthly: {
    id: "monthly",
    amount: 190000,
    currency: "INR",
    label: "Pro Monthly",
    seats: 100,
  },
  yearly: {
    id: "yearly",
    amount: 1500000,
    currency: "INR",
    label: "Pro Yearly",
    seats: 100,
  },
  pro: {
    id: "pro",
    amount: 2900,
    currency: "USD",
    label: "Pro Tier",
    seats: 100,
  },
  enterprise: {
    id: "enterprise",
    amount: 99900,
    currency: "USD",
    label: "Enterprise Tier",
    seats: 500,
  },
  enterprise_lifetime: {
    id: "enterprise_lifetime",
    amount: 1500,
    currency: "USD",
    label: "Enterprise Lifetime",
    seats: 500,
  },
};

export function resolvePlanSpec(rawKey: unknown): PlanSpec | null {
  if (typeof rawKey !== "string") return null;
  const normalized = rawKey.toLowerCase().trim() as PlanKey;
  return Object.prototype.hasOwnProperty.call(PLAN_CATALOG, normalized)
    ? PLAN_CATALOG[normalized]
    : null;
}
