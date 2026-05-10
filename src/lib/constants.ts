export const APP_NAME = "SPM";
export const APP_DESCRIPTION =
  "The Skills Package Manager — discover, publish, and manage AI agent skill packages.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const REGISTRY_API_URL =
  process.env.NEXT_PUBLIC_REGISTRY_API_URL || "http://localhost:3001/api/v1";

export const NAV_ITEMS = [
  { label: "Explore", href: "/" },
  { label: "Search", href: "/search/" },
  { label: "Documentation", href: "/search/" },
] as const;

export const DASHBOARD_NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard" as const,
  },
  { label: "Team", href: "/team", icon: "Users" as const },
  { label: "Billing", href: "/billing", icon: "CreditCard" as const },
] as const;

export const PROTECTED_ROUTES = ["/dashboard", "/team", "/billing"];

export const SEO_DEFAULTS = {
  title: {
    default: "SPM — Skills Package Manager",
    template: "%s | SPM",
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website" as const,
    siteName: APP_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image" as const,
  },
  robots: {
    index: true,
    follow: true,
  },
};
