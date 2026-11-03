import Image from "next/image";

export const ConnectHero = () => {
  return (
    <div className="flex flex-col pt-2 pr-4 sm:pr-8 h-full">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 relative rounded-[2px] overflow-hidden">
          <Image
            src="/images/figma/spm-logo-footer.svg"
            alt="Agent SPM Logo"
            width={32}
            height={32}
            className="object-contain"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/figma/Group 45.png";
            }}
          />
        </div>
        <span className="text-sm font-semibold tracking-tight text-black/80 font-sans">
          Agent SPM Team
        </span>
      </div>

      {/* Eyebrow Tag */}
      <div className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#1A5FED] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1A5FED]" />
        [C] DIRECT LINE
      </div>

      {/* Main Content */}
      <div className="mb-4">
        <h1
          className="font-instrument-serif text-4xl sm:text-5xl italic font-normal text-black tracking-tight leading-[0.95]"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Intro <span className="text-[#1A5FED]">Call.</span>
        </h1>
      </div>

      <p className="text-sm leading-relaxed font-normal text-black/70 mb-8 max-w-[320px] font-sans">
        Schedule a direct intro call with our engineers to discuss how Agent SPM can accelerate your agent workflows and multi-agent systems.
      </p>

      <div className="space-y-4 mb-auto">
        <h3 className="text-xs font-bold text-black/40 tracking-[0.16em] uppercase font-mono">
          Focus Areas
        </h3>
        <ul className="space-y-3 font-sans">
          {[
            "Agent Skills Architecture",
            "Custom Skill Package Dev",
            "Private Registry Deployment",
            "Cross-Agent MCP Integration",
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-sm font-medium text-black/80 tracking-tight hover:text-[#1A5FED] transition-colors cursor-default"
            >
              <span className="w-2 h-2 rounded-full bg-[#1A5FED]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata Footnote */}
      <div className="pt-6 mt-6 border-t border-black/5 font-mono text-[11px] text-black/40">
        30 MIN • GOOGLE MEET • PST / IST
      </div>
    </div>
  );
};
