export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  seatsIncluded: number;
  features: string[];
  isCurrent: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  lastActiveAt?: string;
  seatAssigned: boolean;
}

export interface BillingOverview {
  currentPlan: BillingPlan;
  seatsUsed: number;
  seatsTotal: number;
  nextBillingDate: string;
  currentPeriodEnd: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  createdAt: string;
  pdfUrl?: string;
}
