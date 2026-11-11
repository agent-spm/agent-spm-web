import React from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/shell/AdminShell";

export const metadata: Metadata = {
  title: "Platform Super-Admin | Agent SPM Staff",
  description: "Internal administrative control plane for global registry moderation, feature flags, and telemetry.",
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
