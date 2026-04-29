"use client";

import Spider3DViewer from "@/components/spider-3d-viewer";

const Star = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 0 12 10.5 24 12C24 12 12 13.5 12 24C12 24 12 13.5 0 12C0 12 12 10.5 12 0Z" />
  </svg>
);

const largeGrabCursor = `url("data:image/svg+xml;utf8,<svg width='48' height='48' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'><path d='M18 11V6a2 2 0 0 0-4 0V4a2 2 0 0 0-4 0V5a2 2 0 0 0-4 0v6H5a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6v-9z'/></svg>") 24 24, grab`;

function QuestionBlock({ className, delay }: { className: string, delay: string }) {
  return (
    <div 
      className={`absolute group bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#F3F4F6] flex items-center justify-center animate-bounce pointer-events-auto transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_50px_rgba(139,164,249,0.3)] hover:z-50 ${className}`} 
      style={{ animationDuration: '6s', animationDelay: delay, cursor: largeGrabCursor }}
    >
      <span className="font-black text-[#8BA4F9] select-none" style={{ fontFamily: "Nunito, 'Arial Rounded MT Bold', sans-serif", fontSize: 'clamp(2rem, 5vw, 4rem)' }}>?</span>
      
      {/* Sparkles that appear on hover */}
      <div className="absolute inset-[-50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-[-1]">
        <Star className="absolute top-2 left-0 w-6 h-6 text-[#4DE1C1] rotate-12" />
        <Star className="absolute -top-4 right-4 w-8 h-8 text-[#4D88FF] -rotate-12" />
        <Star className="absolute bottom-8 -left-4 w-5 h-5 text-[#4D88FF] rotate-45" />
        <Star className="absolute -bottom-2 right-0 w-6 h-6 text-[#4DE1C1] rotate-12" />
        <Star className="absolute -bottom-6 right-8 w-4 h-4 text-[#8BA4F9] -rotate-45" />
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FDFDFD] text-[#1D1D1F]">
      {/* Very Light Square Grid Pattern Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFDFD]/90" />
      </div>

      {/* Interactive 3D Viewer - Sits perfectly behind the text but stays interactive */}
      <Spider3DViewer />

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 mt-12 pointer-events-none">
        {/* Huge Typography with Plump Font and Floating Question Marks */}
        <div className="relative inline-block">
          
          {/* Floating Question Mark 1 (Top Left) */}
          <QuestionBlock className="-top-6 -left-12 sm:-left-20 rotate-[-12deg] w-20 h-20 sm:w-28 sm:h-28" delay="0s" />

          <h1 
            className="select-none flex flex-col tracking-tighter uppercase leading-[0.85]"
            style={{ fontFamily: "Nunito, 'Arial Rounded MT Bold', sans-serif", fontWeight: 900 }}
          >
            <span className="text-[22vw] sm:text-[18vw] lg:text-[14vw] bg-gradient-to-b from-[#E2E4EB] via-[#C9CDD8] to-[#A8AEBF] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)] relative z-10">
              COMING
            </span>
            <span className="text-[22vw] sm:text-[18vw] lg:text-[14vw] bg-gradient-to-b from-[#E2E4EB] via-[#C9CDD8] to-[#A8AEBF] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)] relative z-10">
              SOON
            </span>
          </h1>

          {/* Floating Question Mark 2 (Bottom Right) */}
          <QuestionBlock className="bottom-2 -right-4 sm:-right-8 rotate-[15deg] w-16 h-16 sm:w-24 sm:h-24" delay="1s" />
        </div>

        {/* Subtitle & Form Container */}
        <div className="mt-16 sm:mt-24 pointer-events-auto">
          <p className="mb-6 text-sm sm:text-base font-bold text-[#1D1D1F]/70 tracking-tight" style={{ fontFamily: "Nunito, 'Arial Rounded MT Bold', sans-serif" }}>
            Be the first to experience Agent SPM.
          </p>

          <form
            className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8E9ED] max-w-md w-full mx-auto transition-all hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-4 py-2 text-sm text-[#1D1D1F] outline-none placeholder:text-[#1D1D1F]/40"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#6B8DFF] px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-95 shadow-sm hover:bg-[#5A7CEE]"
            >
              {/* Telegram-style send icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.2"/>
              </svg>
              Get notified
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
