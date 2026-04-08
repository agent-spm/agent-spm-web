import React from 'react';

const StatBubble = ({
  label,
  value,
  size,
  className,
  valueSize = "text-[32px]"
}: {
  label: string;
  value: string;
  size: number;
  className?: string;
  valueSize?: string
}) => {
  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-full bg-[#EFEFEF] transition-all hover:scale-105 duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-[14px] text-brand-black/40 font-medium font-sans mb-1">{label}</span>
      <span className={`${valueSize} font-semibold text-brand-black leading-none`}>{value}</span>
    </div>
  );
};

export const Hero = () => {
  return (
    <section className="relative flex flex-col pt-8 pb-10 min-h-[700px] overflow-visible">
      <div className="relative z-10 max-w-[800px]">
        <h1 className="text-[70px] leading-[0.9] font-extralight text-brand-black">
          Welcome to
        </h1>
        <h1 className="text-[70px] leading-[0.9] font-medium text-brand-blue">
          Agent Skills<br />
          Package Manager
        </h1>

        <p className="mt-5 text-[20px] leading-[1.3] font-normal font-sans text-brand-black max-w-[760px]">
          Stop rebuilding. Start compounding. Skills arm your agents with<br />
          battle-tested procedural knowledge — installed in seconds,<br />
          shared across teams, refined over time. We&apos;re building the arsenal.<br />
          You bring the mission.
        </p>
      </div>

      {/* Decorative Stat Bubbles Cluster - Compacted & Centered to Prevent Clipping */}
      <div className="absolute left-0 top-[340px] w-full h-[420px] z-0 pointer-events-none">

        {/* Row 1 - Compact Layout */}
        <StatBubble
          label="Tokens Saved"
          value="82.17 M"
          size={210}
          valueSize="text-[38px]"
          className="left-[230px] top-[0px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-20"
        />

        <StatBubble
          label="Active Agents"
          value="3.1k"
          size={175}
          valueSize="text-[34px]"
          className="left-[20px] top-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] z-20"
        />
        <StatBubble
          label="Contributors"
          value="101"
          size={155}
          valueSize="text-[32px]"
          className="left-[470px] top-[30px] shadow-[0_4px_18px_rgba(0,0,0,0.02)] z-20"
        />
        <StatBubble
          label="Verified Teams"
          value="86"
          size={115}
          valueSize="text-[24px]"
          className="left-[650px] top-[90px] opacity-90 z-20"
        />

        {/* Row 2 - Carefully Placed Transitions */}
        <StatBubble
          label="Success Rate"
          value="99.8%"
          size={145}
          valueSize="text-[28px]"
          className="left-[110px] top-[240px] opacity-90 z-10"
        />
        <StatBubble
          label="Total Packages"
          value="12.8k"
          size={165}
          valueSize="text-[32px]"
          className="left-[340px] top-[240px] opacity-90 z-10"
        />
        <StatBubble
          label="Skills"
          value="2.4k"
          size={125}
          valueSize="text-[26px]"
          className="left-[560px] top-[230px] opacity-90 z-10"
        />

        {/* Minimal Decorative Dots */}
        <div className="absolute left-[200px] top-[210px] w-[10px] h-[10px] bg-[#EFEFEF] rounded-full" />
        <div className="absolute left-[440px] top-[190px] w-[8px] h-[8px] bg-[#EFEFEF] rounded-full" />
      </div>
    </section>
  );
};

