import { Navbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans relative selection:bg-[#1A5FED]/10 selection:text-[#1A5FED]">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
        <Navbar />
      </div>
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
