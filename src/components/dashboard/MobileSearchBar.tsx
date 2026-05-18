"use client";

import { useRouter } from 'next/navigation';

export const MobileSearchBar = () => {
  const router = useRouter();

  return (
    <div
      className="relative cursor-pointer w-full"
      onClick={() => router.push('/search/')}
    >
      {/* Search icon */}
      <div className="absolute left-[14px] top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search skills ..."
        readOnly
        onClick={() => router.push('/search/')}
        onKeyDown={(e) => { if (e.key === 'Enter') router.push('/search/'); }}
        className="w-full h-[48px] border border-[#E2E0E6] rounded-[6px] pl-[36px] pr-[44px] text-[14px] font-mono text-black placeholder:text-black/50 outline-none cursor-pointer tracking-tight font-light"
        style={{ background: '#F5F5F2' }}
      />

      {/* / shortcut badge — shown on mobile matching Figma */}
      <div className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[15px] text-black/50 font-mono font-light">/</span>
      </div>
    </div>
  );
};
