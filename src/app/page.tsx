import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/dashboard/Hero";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { MobileSearchBar } from "@/components/dashboard/MobileSearchBar";

export default function Home() {
  return (
    <main className="bg-[#F4F4F2]">

      {/* ── MOBILE layout: single column, full-height, search bar pinned at bottom ── */}
      <div className="flex flex-col h-screen lg:hidden">
        <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-6 overflow-hidden">
          <Navbar />
          <Hero />
        </div>
        {/* Search bar pinned at bottom on mobile — matches Figma */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2">
          <MobileSearchBar />
        </div>
      </div>

      {/* ── DESKTOP layout: two-column, no-scroll ── */}
      <div className="hidden lg:flex h-screen overflow-hidden w-full max-w-[1500px] mx-auto">

        {/* Left half: Navbar + Hero + Bubbles */}
        <div className="flex flex-col w-[62%] xl:w-[62%] h-full px-8 flex-shrink-0 overflow-hidden">
          <Navbar />
          <Hero />
        </div>

        {/* Right half: Leaderboard full height */}
        <div className="flex flex-col flex-1 h-full py-4 pr-8 min-w-0">
          <Leaderboard />
        </div>

      </div>
    </main>
  );
}
