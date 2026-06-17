import { Navbar } from "@/components/layout/Navbar";
import { BubbleVortex } from "@/components/landing/BubbleVortex";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F4F2] pb-12">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-4 md:gap-6">
        <Navbar />
        <BubbleVortex />
      </div>
    </main>
  );
}
