import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/dashboard/Hero";
import { Leaderboard } from "@/components/dashboard/Leaderboard";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-[#F4F4F2]">
      <div className="w-full max-w-[1500px] mx-auto h-full flex">

        {/* ── LEFT HALF: Navbar (top) + Hero text + Bubbles (below) ── */}
        <div className="flex flex-col w-full lg:w-[55%] xl:w-[57%] h-full px-4 sm:px-6 lg:px-8 flex-shrink-0 overflow-hidden">
          <Navbar />
          <Hero />
        </div>

        {/* ── RIGHT HALF: Leaderboard — full height, top to bottom ── */}
        <div className="hidden lg:flex flex-col flex-1 h-full py-4 pr-4 sm:pr-6 lg:pr-8 min-w-0">
          <Leaderboard />
        </div>

      </div>
    </main>
  );
}
