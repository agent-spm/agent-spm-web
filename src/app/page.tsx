import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* ── Gradient Backdrop Section ── */}
      <section className="relative w-full min-h-screen bg-gradient-to-b from-[#002DDF] via-[#5EA6FE] to-white pt-2 sm:pt-4 pb-24 overflow-hidden">


        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
          <Navbar />
        </div>




      </section>
    </main>
  );
}
