import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BookingFormProps {
  onBack: () => void;
  onConfirm: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onBack, onConfirm }) => {
  return (
    <div className="flex flex-col w-full max-w-[600px] animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-black/10 hover:bg-brand-black/5 transition-all"
        >
          <ArrowLeft size={20} className="text-brand-black" />
        </button>
        <h2 className="text-[22px] font-semibold text-brand-black tracking-tight tracking-tight">Confirm Details</h2>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium mono text-brand-black/40">NAME *</label>
          <input 
            type="text" 
            placeholder="John Doe" 
            className="w-full h-[50px] bg-white border border-black/10 rounded-[8px] px-5 text-[16px] font-sans text-brand-black placeholder:text-black/30 outline-none focus:border-brand-blue/30 transition-all font-medium shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium mono text-brand-black/40">EMAIL ADDRESS *</label>
          <input 
            type="email" 
            placeholder="john@example.com" 
            className="w-full h-[50px] bg-white border border-black/10 rounded-[8px] px-5 text-[16px] font-sans text-brand-black placeholder:text-black/30 outline-none focus:border-brand-blue/30 transition-all font-medium shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium mono text-brand-black/40">CONTEXT / MEETING NOTES</label>
          <textarea 
            rows={3}
            placeholder="What would you like to discuss?" 
            className="w-full bg-white border border-black/10 rounded-[8px] p-5 text-[16px] font-sans text-brand-black placeholder:text-black/30 outline-none focus:border-brand-blue/30 transition-all font-medium shadow-sm resize-none"
          />
        </div>

        <div className="pt-2">
          <button 
            onClick={onConfirm}
            className="h-[52px] px-10 bg-brand-blue text-white rounded-[8px] font-semibold text-[16px] transition-all hover:bg-brand-blue/90 hover:shadow-lg active:scale-[0.98]"
          >
            Schedule Event
          </button>
          <p className="mt-3 text-[12px] text-brand-black/40 font-sans leading-snug">
            By proceeding, you confirm that you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
