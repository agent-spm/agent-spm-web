import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills Package Manager",
  description: "Stop rebuilding. Start compounding. Skills arm your agents with battle-tested procedural knowledge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
