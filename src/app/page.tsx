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

      {/* ── DESKTOP layout: full-width Navbar + two-column content ── */}
      <div className="hidden lg:flex flex-col h-screen overflow-hidden w-full max-w-[1500px] mx-auto px-8">
        <Navbar />
        <div className="flex flex-1 min-h-0 w-full pt-2 pb-6">
          {/* Left half: Hero + Bubbles */}
          <div className="flex flex-col w-[62%] xl:w-[62%] h-full flex-shrink-0 overflow-hidden">
            <Hero />
          </div>

          {/* Right half: Leaderboard */}
          <div className="flex flex-col flex-1 h-full pl-8 min-w-0">
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  );
}
