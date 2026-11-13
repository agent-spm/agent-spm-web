import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface BookingFormProps {
  onBack: () => void;
  onConfirm: (name?: string, email?: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onBack, onConfirm }) => {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@acme.labs");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name, email);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[540px] animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          type="button"
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Chen" 
            className="w-full h-[44px] bg-white border border-black/10 rounded-[6px] px-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:ring-2 focus:ring-[#1A5FED]/10 transition-all shadow-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold font-mono text-black/60 uppercase tracking-wider">
            WORK EMAIL *
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@acme.labs" 
            className="w-full h-[44px] bg-white border border-black/10 rounded-[6px] px-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:ring-2 focus:ring-[#1A5FED]/10 transition-all shadow-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold font-mono text-black/60 uppercase tracking-wider">
            TOPIC & GOALS
          </label>
          <textarea 
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us about your agent workflows or MCP packages..." 
            className="w-full bg-white border border-black/10 rounded-[6px] p-4 text-sm font-sans text-black placeholder:text-black/35 outline-none focus:border-[#1A5FED] focus:ring-2 focus:ring-[#1A5FED]/10 transition-all shadow-xs resize-none"
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full sm:w-auto h-[44px] px-8 bg-black text-white rounded-[6px] font-sans font-semibold text-sm transition-all hover:bg-black/90 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            Confirm &amp; Schedule Call →
          </button>
          <p className="mt-3 text-xs text-black/45 font-sans leading-relaxed">
            By proceeding, you agree to our Terms of Service and Privacy Policy. A Google Meet invitation will be sent to your inbox.
          </p>
        </div>
      </div>
    </form>
  );
};
