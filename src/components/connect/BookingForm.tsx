import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BookingFormProps {
  onBack: () => void;
  onConfirm: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onBack, onConfirm }) => {
  return (
    <div className="flex flex-col w-full max-w-[540px] animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-black/10 hover:bg-black/5 transition-all cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-black/80" />
        </button>
        <h2 className="text-xl font-semibold text-black tracking-tight font-sans">Confirm Meeting Details</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 font-sans">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold font-mono text-black/60 uppercase tracking-wider">
            YOUR NAME *
          </label>
          <input 
            type="text" 
            placeholder="Ada Lovelace" 
            className="w-full h-[44px] bg-[#F7F7F7] border border-black/10 rounded-[4px] px-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:bg-white transition-all shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold font-mono text-black/60 uppercase tracking-wider">
            WORK EMAIL *
          </label>
          <input 
            type="email" 
            placeholder="ada@company.com" 
            className="w-full h-[44px] bg-[#F7F7F7] border border-black/10 rounded-[4px] px-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:bg-white transition-all shadow-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold font-mono text-black/60 uppercase tracking-wider">
            TOPIC & GOALS
          </label>
          <textarea 
            rows={3}
            placeholder="Tell us about the agent stack you are building..." 
            className="w-full bg-[#F7F7F7] border border-black/10 rounded-[4px] p-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:bg-white transition-all shadow-none resize-none"
          />
        </div>

        <div className="pt-2">
          <button 
            onClick={onConfirm}
            className="w-full sm:w-auto h-[44px] px-8 bg-black text-white rounded-[4px] font-sans font-semibold text-sm transition-all hover:bg-black/90 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            Confirm &amp; Schedule Call →
          </button>
          <p className="mt-3 text-xs text-black/45 font-sans leading-relaxed">
            By proceeding, you agree to our Terms of Service and Privacy Policy. A Google Meet invitation will be sent to your inbox.
          </p>
        </div>
      </div>
    </div>
  );
};
