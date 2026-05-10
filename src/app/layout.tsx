import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
});

export const metadata: Metadata = {
  title: "Agent Skills Package Manager | Build Smarter AI Agents",
  description: "Stop rebuilding. Start compounding. Skills arm your agents with battle-tested procedural knowledge — installed in seconds, shared across teams, refined over time.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://agent-spm.com"),
  keywords: ["agent skills", "package manager", "AI agents", "procedural knowledge", "SPM", "agent tools"],
  authors: [{ name: "TrndCtrl" }],
  openGraph: {
    title: "Agent Skills Package Manager",
    description: "Stop rebuilding. Start compounding. Battle-tested procedural knowledge for your AI agents.",
    siteName: "Agent SPM",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Skills Package Manager",
    description: "Stop rebuilding. Start compounding. Battle-tested procedural knowledge for your AI agents.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#1B5FED",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconnect to Google Fonts for mono font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Fragment Mono for bracket buttons */}
        <link href="https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
