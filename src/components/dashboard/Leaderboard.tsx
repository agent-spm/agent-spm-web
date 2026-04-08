import React from 'react';

const LeaderboardTag = ({ 
  label, 
  color 
}: { 
  label: string; 
  color: string 
}) => {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-black/[0.04] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[13.5px] font-sans font-medium text-brand-black/90 whitespace-nowrap tracking-tight">{label}</span>
    </div>
  );
};

export const Leaderboard = () => {
  // Mock data for the dot chart to match the figma curve precisely
  const points = [
    { x: 10, y: 380 }, { x: 18, y: 372 }, { x: 26, y: 365 }, { x: 34, y: 360 },
    { x: 42, y: 350 }, { x: 42, y: 340 }, { x: 50, y: 335 }, { x: 58, y: 345 },
    { x: 66, y: 355 }, { x: 74, y: 345 }, { x: 82, y: 335 }, { x: 90, y: 325 },
    { x: 98, y: 315 }, { x: 106, y: 305 }, { x: 114, y: 295 }, { x: 122, y: 285 },
    { x: 130, y: 275 }, { x: 138, y: 265 }, { x: 146, y: 255 }, { x: 154, y: 245 },
    { x: 162, y: 235 }, { x: 170, y: 225 }, { x: 178, y: 215 }, { x: 186, y: 205 },
    { x: 194, y: 195 }, { x: 202, y: 185 }, { x: 210, y: 175 }, { x: 218, y: 165 },
    { x: 226, y: 155 }, { x: 234, y: 145 }, { x: 242, y: 135 }, { x: 250, y: 125 },
    { x: 258, y: 132 }, { x: 266, y: 138 }, { x: 274, y: 132 }, { x: 282, y: 125 },
    { x: 290, y: 115 }, { x: 298, y: 105 }, { x: 306, y: 95 }, { x: 314, y: 85 },
    { x: 314, y: 75 }, { x: 314, y: 65 }, { x: 322, y: 55 }, { x: 330, y: 45 },
    { x: 338, y: 35 }, { x: 346, y: 25 }, { x: 354, y: 18 }, { x: 362, y: 12 },
    { x: 370, y: 8 },
  ];

  return (
    <div className="flex flex-col bg-[#E2E0E6] border border-[#E8E9ED] rounded-[16px] p-7 w-full max-w-none shadow-[0_4px_20px_rgba(0,0,0,0.01)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] text-brand-blue mono tracking-tight">SKILLS LEADERBOARD</h2>
        <span className="text-[14px] text-brand-black/40 font-sans font-medium">Week of April 6</span>
      </div>
      
      {/* Filters */}
      <div className="flex gap-1.5 mb-1.5">
        <button className="bracket-btn active h-[30px] px-3.5 text-[12px] rounded-[4px]">ALL TIME</button>
        <button className="bracket-btn h-[30px] px-3.5 text-[12px] rounded-[4px]">TRENDING (24H)</button>
        <button className="bracket-btn h-[30px] px-3.5 text-[12px] rounded-[4px]">HOT</button>
      </div>

      {/* Chart Main Container */}
      <div className="relative flex-1 w-full flex min-h-[550px] bg-[#E2E0E6] rounded-[12px]">
        
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-[30px] bottom-[20px] flex flex-col justify-between text-[14px] text-brand-black/30 font-sans font-medium z-10 pointer-events-none pr-4">
          <div>350k</div>
          <div>120k</div>
          <div>100k</div>
        </div>

        {/* The Grid and Chart Area */}
        <div className="relative flex-1 ml-14 mr-[200px] h-full">
          {/* Vertical Grid Lines - Dotted style */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {[...Array(13)].map((_, i) => (
              <div 
                key={i} 
                className="w-[1px] h-full" 
                style={{ 
                  backgroundImage: 'linear-gradient(to bottom, #adadaaff 40%, rgba(255,255,255,0) 0%)',
                  backgroundPosition: 'left',
                  backgroundSize: '1px 8px',
                   backgroundRepeat: 'repeat-y'
                }} 
              />
            ))}
          </div>

          {/* Solid Blue Line at the end of grid */}
          <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-brand-blue z-20" />

          {/* SVG Chart */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 370 400" 
            preserveAspectRatio="none"
            className="absolute inset-0 z-10 overflow-visible"
          >
            {/* Connecting Line */}
            <path 
              d={`M ${points[0].x} ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
              fill="none"
              stroke="#1B5FED"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <circle 
                key={i} 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="#1B5FED" 
                stroke="white"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {/* Labels aligned to the blue line */}
          <div className="absolute left-full top-0 bottom-0 flex flex-col z-30 justify-start pt-14 gap-24 ml-4 pointer-events-none">
            <div className="translate-x-0">
              <LeaderboardTag label="@lakshit/web2-ui" color="#FFB800" />
            </div>
            <div className="translate-x-0 translate-y-10">
              <LeaderboardTag label="@daksh/system-design" color="#EE0000" />
            </div>
            <div className="translate-x-0 translate-y-24">
              <LeaderboardTag label="@rahul/web2-security" color="#1B5FED" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-8 relative">
        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 opacity-40">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search skills ..." 
          className="w-full h-[54px] bg-white border border-black/10 rounded-[10px] pl-[52px] pr-12 text-[17px] font-sans text-brand-black placeholder:text-black outline-none focus:border-brand-blue/30 transition-all font-medium"
        />
      
      </div>
    </div>
  );
};



