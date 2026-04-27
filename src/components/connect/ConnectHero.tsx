import Image from 'next/image';

export const ConnectHero = () => {
  return (
    <div className="flex flex-col pt-2 pr-12 h-full">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 relative">
          <Image
            src="/images/logo.png"
            alt="Agent SPM Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <span className="text-[15px] font-medium tracking-tight text-brand-black/60 font-sans">
          Agent SPM Team
        </span>
      </div>

      {/* Main Content */}
      <div className="mb-4">
        <h1 className="text-[48px] leading-[0.9] font-medium text-brand-black tracking-tighter">
          Intro <span className="text-brand-blue">Call</span>
        </h1>
      </div>

      <p className="text-[15px] leading-[1.4] font-normal text-brand-black/80 mb-5 max-w-[360px] font-sans">
        Schedule a free intro call with our engineers to discuss how Agent SPM can accelerate your workflows.
      </p>

      <div className="space-y-4 mb-auto">
        <h3 className="text-[14px] font-bold text-brand-black/20 tracking-[0.2em] uppercase mb-4">
          Focus Areas
        </h3>
        <ul className="space-y-4">
          {[
            "SPM Integration",
            "Custom Skill Dev",
            "Registry Setup",
            "Performance Opt"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-[16px] font-medium text-brand-black/70 font-sans tracking-tight hover:text-brand-blue transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-brand-blue/40" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata removed for minimalism */}
    </div>
  );
};

