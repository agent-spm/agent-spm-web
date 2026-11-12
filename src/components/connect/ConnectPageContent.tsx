"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PixelBox } from "@/components/landing/PixelBox";
import { StrayPixelField } from "@/components/shared/StrayPixelField";
import { ConnectHero } from "@/components/connect/ConnectHero";
import { Calendar } from "@/components/connect/Calendar";
import { TimeSlotPicker } from "@/components/connect/TimeSlotPicker";
import { BookingForm } from "@/components/connect/BookingForm";
import { useToast } from "@/components/ui/ToastProvider";
import { CheckCircle2, Calendar as CalendarIcon, Clock, Video, ArrowRight } from "lucide-react";

// Dynamically compute the current initial available date
const getInitialDate = () => {
  const today = new Date();
  const day = today.getDay();
  // If Saturday (6), advance to Monday (+2). If Sunday (0), advance to Monday (+1).
  if (day === 6) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  } else if (day === 0) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  }
  return today;
};

export const ConnectPageContent = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState<"selection" | "details" | "confirmed">("selection");
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState<string | null>("10:00");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (selectedTime) {
      setStep("details");
    }
  };

  const handleBack = () => {
    setStep("selection");
  };

  const handleConfirm = (name?: string, email?: string) => {
    if (name) setAttendeeName(name);
    if (email) setAttendeeEmail(email);
    setStep("confirmed");
    showToast({
      title: "Call Scheduled Successfully",
      message: `Confirmed for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${selectedTime}`,
      type: "success",
    });
  };

  const formattedDateString = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans relative overflow-x-hidden selection:bg-[#1A5FED]/10 selection:text-[#1A5FED]">
      {/* ─── Hero Section with Signature Deep Blue-Purple Gradient & Seamless Navbar ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #190096 0%, #0080FF 18%, #78D2FF 53%, #cce9ff 72%, #ffffff 100%)",
          boxShadow:
            "inset 0 0 120px rgba(255,255,255,0.85), inset 0 0 40px rgba(255,255,255,0.5)",
        }}
      >
        {/* Universal Agent SPM Navigation Bar sitting seamlessly on gradient with 0 offset */}
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
          <Navbar />
        </div>

        {/* Ambient Breathing Stray Pixel Debris */}
        <StrayPixelField />

        <div className="relative max-w-[1200px] mx-auto flex flex-col items-center z-10 pt-6 sm:pt-10 pb-6 px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            DIRECT LINE • AGENT SPM ENGINEERING
          </div>

          {/* Compact Headline (Bulky redundant paragraph removed for clean vertical rhythm) */}
          <div className="text-center max-w-2xl mb-6 sm:mb-8">
            <h1
              className="font-instrument-serif text-5xl sm:text-6xl lg:text-[70px] leading-[1.0] text-white font-normal italic tracking-tight select-none"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Connect. with our Team.
            </h1>
          </div>

          {/* ─── 4-Layer Liquid Glass Chiclet Card ─── */}
          <div className="glass-card-shell relative w-full max-w-[1100px] min-h-[560px] rounded-[12px] border border-black/10 shadow-2xl text-black flex flex-col md:flex-row overflow-hidden transition-all duration-300">
            {/* Layer 0: Liquid Distortion Filter */}
            <div className="glass-card-filter pointer-events-none" aria-hidden="true" />

            {/* Layer 1: Translucent Glass Overlay */}
            <div className="glass-card-overlay bg-white/95 backdrop-blur-md pointer-events-none" aria-hidden="true" />

            {/* Layer 2: Specular Rim Highlight */}
            <div className="glass-card-specular pointer-events-none" aria-hidden="true" />

            {/* Layer 3: Crisp Foreground Content */}
            <div className="glass-card-content relative z-10 w-full flex flex-col md:flex-row h-full">
              {/* Left Side: Permanently Visible Info */}
              <aside className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-black/10 p-6 md:p-8 bg-white/80 z-10 shrink-0">
                <ConnectHero />
              </aside>

              {/* Right Side: Step-dependent Interactive Content */}
              <main className="flex-1 relative bg-white/50">
                {step === "selection" && (
                  <div className="flex flex-col md:flex-row h-full animate-in fade-in slide-in-from-right-2 duration-300">
                    {/* Calendar Pane */}
                    <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 flex justify-center">
                      <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                      />
                    </div>

                    {/* Time Slots Pane */}
                    <div className="w-full md:w-[280px] p-6 md:p-8 flex justify-center bg-black/[0.015]">
                      <TimeSlotPicker
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onTimeSelect={handleTimeSelect}
                        onConfirm={handleNextStep}
                      />
                    </div>
                  </div>
                )}

                {step === "details" && (
                  <div className="h-full p-8 md:p-12 flex items-start justify-center bg-white/60 overflow-y-auto">
                    <BookingForm
                      onBack={handleBack}
                      onConfirm={handleConfirm}
                    />
                  </div>
                )}

                {step === "confirmed" && (
                  <div className="h-full p-8 md:p-14 flex flex-col items-center justify-center text-center bg-white/70 animate-in fade-in zoom-in-95 duration-300 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[#1B5FED] font-semibold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                        CONFIRMED MEETING
                      </span>
                      <h2
                        className="font-instrument-serif text-4xl sm:text-5xl italic font-normal text-black tracking-tight mt-3 mb-2"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                      >
                        You&apos;re on the calendar!
                      </h2>
                      <p className="text-sm text-black/70 font-sans max-w-md mx-auto">
                        A Google Meet invitation with dial-in instructions has been sent to{" "}
                        <span className="font-semibold text-black">{attendeeEmail || "your email"}</span>.
                      </p>
                    </div>

                    {/* Meeting Summary Pill Box */}
                    <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-5 shadow-xs space-y-3 text-left font-sans text-xs">
                      <div className="flex items-center gap-3 text-black/80">
                        <CalendarIcon className="w-4 h-4 text-[#1B5FED] shrink-0" />
                        <span className="font-medium text-black">{formattedDateString}</span>
                      </div>
                      <div className="flex items-center gap-3 text-black/80">
                        <Clock className="w-4 h-4 text-[#1B5FED] shrink-0" />
                        <span>{selectedTime} • 30 Minutes</span>
                      </div>
                      <div className="flex items-center gap-3 text-black/80">
                        <Video className="w-4 h-4 text-[#1B5FED] shrink-0" />
                        <span>Google Meet (Link enclosed in invite)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setStep("selection");
                          setSelectedTime(null);
                        }}
                        className="px-5 py-2.5 rounded-lg border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        ← Book Another Time
                      </button>
                      <a
                        href="/app"
                        className="px-5 py-2.5 rounded-lg bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span>Go to Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        {/* ─── Page 2 — Working Pixel art scroll-reveal zone matching Home page ─── */}
        <div className="relative h-[24vh] sm:h-[32vh] w-full pointer-events-none mt-6">
          <div
            className="absolute left-0 w-full z-30 pointer-events-none select-none transform-gpu -translate-y-[10%]"
            style={{ top: 0 }}
          >
            <PixelBox color="#ffffff" />
          </div>
        </div>
      </section>

      {/* ─── Universal Agent SPM Footer ─── */}
      <LandingFooter />
    </div>
  );
};
