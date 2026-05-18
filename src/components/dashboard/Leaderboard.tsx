"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const LeaderboardTag = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm border border-[#C9C9C9] backdrop-blur-sm min-w-0"
    style={{ background: '#F5F5F2' }}>
    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-sans font-normal text-black tracking-tight truncate max-w-[100px] lg:max-w-[120px]">{label}</span>
  </div>
);

export const Leaderboard = () => {
  const router = useRouter();
  // Exact dot positions from Figma SVG, viewBox 0 0 440 812
  const dots: [number, number][] = [
    [6,808],[14,800],[14,790],[22,782],[30,774],[38,766],[38,756],
    [48,756],[58,756],[66,764],[74,772],[82,764],[90,756],
    [98,748],[106,740],[114,732],[122,724],[130,716],[138,708],
    [146,700],[154,692],[162,684],[170,676],[178,668],[186,660],
    [194,652],[202,644],[210,636],[218,628],[226,620],[234,612],
    [242,604],[250,596],[258,588],[266,580],[274,572],[284,572],
    [292,580],[300,572],[308,564],[316,556],[324,548],[332,540],
    [340,532],[348,524],[356,516],[364,508],[374,508],[374,498],
    [374,488],[374,478],[374,468],[382,460],[390,452],[398,444],
    [406,436],[414,428],[414,418],[422,410],[430,402],
  ];

  const gridXs = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden rounded-[4px] border-2 border-[#E3E2DF]"
      style={{ background: '#EFEDE9' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-5 lg:pt-7">
        <h2 className="text-[14px] sm:text-[18px] lg:text-[22px] text-[#1A5FED] mono tracking-tight font-normal leading-tight">
          SKILLS LEADERBOARD
        </h2>
        <span className="text-[10px] sm:text-[13px] lg:text-[18px] text-[#979794] font-sans font-medium tracking-tight whitespace-nowrap ml-2">
          2nd Week of April
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-1 sm:gap-1.5 px-3 sm:px-5 mt-2 sm:mt-3">
        <button className="bracket-btn active h-[24px] sm:h-[28px] lg:h-[36px] px-2 sm:px-3 lg:px-4 text-[9px] sm:text-[11px] lg:text-[16px] rounded-[2px]">ALL TIME</button>
        <button className="bracket-btn h-[24px] sm:h-[28px] lg:h-[36px] px-2 sm:px-3 lg:px-4 text-[9px] sm:text-[11px] lg:text-[16px] rounded-[2px]">TRENDING (24H)</button>
        <button className="bracket-btn h-[24px] sm:h-[28px] lg:h-[36px] px-2 sm:px-3 lg:px-4 text-[9px] sm:text-[11px] lg:text-[16px] rounded-[2px]">HOT</button>
      </div>

      {/* ── MOBILE LAYOUT (< lg): chart full width, tags below ── */}
      <div className="flex-1 flex flex-col lg:hidden mt-2 sm:mt-3 mx-1 sm:mx-2 min-h-0">
        {/* Chart row: y-axis + SVG */}
        <div className="flex-1 flex min-h-[220px] sm:min-h-[320px]">
          {/* Y-axis labels */}
          <div className="relative w-[28px] sm:w-[36px] flex-shrink-0 text-[8px] sm:text-[11px] text-[#979794] font-sans font-medium tracking-tight">
            <div style={{ position: 'absolute', top: '10.5%' }}>350k</div>
            <div style={{ position: 'absolute', top: '29.3%' }}>120k</div>
            <div style={{ position: 'absolute', top: '50.5%' }}>100k</div>
          </div>
          {/* SVG chart — takes full remaining width */}
          <div className="flex-1 relative min-w-0">
            <svg className="w-full h-full" viewBox="0 0 440 812" preserveAspectRatio="none">
              {gridXs.map((x, i) => (
                <line key={`g-${i}`} x1={x} y1={0} x2={x} y2={812}
                  stroke="black" strokeOpacity={0.08} strokeWidth={1}
                  vectorEffect="non-scaling-stroke" />
              ))}
              <line x1={440} y1={-20} x2={440} y2={830}
                stroke="#1A5FED" strokeWidth={3}
                strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {dots.map(([cx, cy], i) => (
                <rect key={i} x={cx - 4} y={cy - 4} width={8} height={8} rx={4}
                  fill="#1A5FED" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
        </div>
        {/* Tags — horizontal row below chart on mobile */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 justify-center">
          <LeaderboardTag label="@lakshit/web2-ui" color="#FFB300" />
          <LeaderboardTag label="@daksh/system-design" color="#CF0003" />
          <LeaderboardTag label="@rahul/web2-security" color="#1A5FED" />
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (>= lg): chart + tags side by side ── */}
      <div className="hidden lg:flex flex-1 mt-2 mx-3 min-h-0 overflow-hidden">
        {/* Y-axis labels */}
        <div className="relative w-[48px] flex-shrink-0 text-[16px] text-[#979794] font-sans font-medium tracking-tight">
          <div style={{ position: 'absolute', top: '10.5%' }}>350k</div>
          <div style={{ position: 'absolute', top: '29.3%' }}>120k</div>
          <div style={{ position: 'absolute', top: '50.5%' }}>100k</div>
        </div>
        {/* SVG chart */}
        <div className="flex-1 relative min-w-0">
          <svg className="w-full h-full" viewBox="0 0 440 812" preserveAspectRatio="none">
            {gridXs.map((x, i) => (
              <line key={`g-${i}`} x1={x} y1={0} x2={x} y2={812}
                stroke="black" strokeOpacity={0.08} strokeWidth={1}
                vectorEffect="non-scaling-stroke" />
            ))}
            <line x1={440} y1={-20} x2={440} y2={830}
              stroke="#1A5FED" strokeWidth={3}
              strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {dots.map(([cx, cy], i) => (
              <rect key={i} x={cx - 4} y={cy - 4} width={8} height={8} rx={4}
                fill="#1A5FED" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </div>
        {/* Tags — positioned vertically alongside chart on desktop */}
        <div className="relative w-[155px] flex-shrink-0 ml-1 overflow-hidden">
          <div style={{ position: 'absolute', top: '10.5%', transform: 'translateY(-50%)' }}>
            <LeaderboardTag label="@lakshit/web2-ui" color="#FFB300" />
          </div>
          <div style={{ position: 'absolute', top: '29.3%', transform: 'translateY(-50%)' }}>
            <LeaderboardTag label="@daksh/system-design" color="#CF0003" />
          </div>
          <div style={{ position: 'absolute', top: '50.5%', transform: 'translateY(-50%)' }}>
            <LeaderboardTag label="@rahul/web2-security" color="#1A5FED" />
          </div>
        </div>
      </div>

      {/* Search Bar — navigates to /search/ */}
      <div className="mx-3 sm:mx-5 mb-3 sm:mb-5 mt-3 sm:mt-4 relative cursor-pointer" onClick={() => router.push('/search/')}>
        <div className="absolute left-[10px] sm:left-[16px] top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px] lg:w-[24px] lg:h-[24px]">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search skills ..."
          readOnly
          onClick={() => router.push('/search/')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === '/') router.push('/search/'); }}
          className="w-full h-[34px] sm:h-[44px] lg:h-[56px] border border-[#E2E0E6] rounded-[4px] pl-[30px] sm:pl-[40px] lg:pl-[52px] pr-8 sm:pr-10 lg:pr-12 text-[11px] sm:text-[14px] lg:text-[20px] font-mono text-black placeholder:text-black/60 outline-none focus:border-[#1A5FED]/30 transition-all font-light tracking-tight cursor-pointer"
          style={{ background: '#F5F5F2' }}
        />
        <div className="absolute right-[10px] sm:right-[14px] lg:right-[16px] top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[12px] sm:text-[16px] lg:text-[22px] text-black/60 font-mono font-light tracking-tight">/</span>
        </div>
      </div>
    </div>
  );
};
