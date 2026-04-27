import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/dashboard/Hero";
import { Leaderboard } from "@/components/dashboard/Leaderboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F4F2] flex flex-col items-center">
      <div className="w-full flex items-stretch gap-24 pl-12 pr-4 min-h-screen">
        {/* Left Column: Navbar and Hero */}
        <div className="flex flex-col min-w-[650px]">
          <Navbar />
          <Hero />
        </div>
        
        {/* Right Column: Leaderboard Widget (Top Aligned) */}
        <div className="flex-1 pt-4 pr-0">
           <Leaderboard />
        </div>
      </div>
    </main>
  );
}
