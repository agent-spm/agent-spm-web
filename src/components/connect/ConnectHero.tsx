import React from 'react';
import Image from 'next/image';
import { Clock, Video, Globe } from 'lucide-react';

export const ConnectHero = () => {
  return (
    <div className="flex flex-col pt-8 pr-12">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 relative">
          <Image 
            src="/images/logo.png" 
            alt="Agent SPM Logo" 
            fill
            className="object-contain"
          />
        </div>
        <span className="text-[18px] font-medium tracking-tight text-brand-black/60">
          Agent SPM Team
        </span>
      </div>

      {/* Main Content */}
      <h1 className="text-[64px] leading-[0.9] font-medium text-brand-black mb-6">
        Intro <span className="text-brand-blue">Call</span>
      </h1>

      <p className="text-[18px] leading-relaxed text-brand-black/70 mb-8 max-w-[450px]">
        Schedule a free intro call with our core engineers to discuss how Agent SPM can accelerate your agentic workflows.
      </p>

      <div className="space-y-4 mb-12">
        <h3 className="text-[16px] font-semibold uppercase tracking-wider text-brand-black/40">
          We&apos;ll chat about:
        </h3>
        <ul className="space-y-3">
          {[
            "Integrating SPM with your existing stack",
            "Custom skill development & procedures",
            "Enterprise registry management",
            "Performance optimization for LLM agents"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[17px] text-brand-black/80">
              <span className="text-brand-blue mt-1.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="space-y-4 pt-6 border-t border-brand-black/5">
        <div className="flex items-center gap-3 text-brand-black/60">
          <Clock size={20} className="text-brand-blue" />
          <span className="text-[16px]">30 min</span>
        </div>
        <div className="flex items-center gap-3 text-brand-black/60">
          <Video size={20} className="text-brand-blue" />
          <span className="text-[16px]">Google Meet</span>
        </div>
        <div className="flex items-center gap-3 text-brand-black/60">
          <Globe size={20} className="text-brand-blue" />
          <span className="text-[16px]">Asia/Kolkata</span>
        </div>
      </div>
    </div>
  );
};
