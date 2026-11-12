import React from "react";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";

export const metadata = {
  title: "Pricing — SPM",
  description:
    "Compare SPM developer and enterprise plans. Find the perfect balance of public package publishing limits, private namespaces, and dedicated SLAs for your AI agent skills.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
