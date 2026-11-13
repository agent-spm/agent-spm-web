import React from "react";
import { AppShell } from "@/components/shell/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Agent SPM Workspace",
  description: "Manage packages, deploy skills, monitor team telemetry, and configure enterprise org policies.",
};

export default function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
