import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/dashboard/Hero";
import { Leaderboard } from "@/components/dashboard/Leaderboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F4F2] overflow-x-hidden">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Navbar spans full width */}
        <Navbar />

        {/* Content grid: stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 min-h-[calc(100vh-80px)] pb-8 lg:pb-0">
          {/* Left Column: Hero */}
          <div className="w-full lg:w-[55%] xl:w-[50%] flex-shrink-0">
            <Hero />
          </div>
          
          {/* Right Column: Leaderboard Widget */}
          <div className="w-full lg:flex-1 min-w-0">
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  );
}
