"use client";

import React, { useState } from "react";
import { ConnectHero } from "@/components/connect/ConnectHero";
import { Calendar } from "@/components/connect/Calendar";
import { TimeSlotPicker } from "@/components/connect/TimeSlotPicker";
import { BookingForm } from "@/components/connect/BookingForm";

export default function ConnectPage() {
  const [step, setStep] = useState<"selection" | "details">("selection");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 13)); // Default as per design
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  const handleConfirm = () => {
    console.log("Booking confirmed:", { selectedDate, selectedTime });
    alert("Booking request received! Our engineering team will contact you shortly.");
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Subtle Top Cyan Glow matching Hero gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[320px] bg-gradient-to-b from-[#78D2FF]/20 via-[#0080FF]/5 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Main Unified Card Container */}
      <div className="w-full max-w-[1100px] min-h-[580px] bg-white rounded-[12px] border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row overflow-hidden transition-all duration-300">
        {/* Left Side: Permanently Visible Info */}
        <aside className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-black/10 p-6 md:p-8 bg-white z-10 shrink-0">
          <ConnectHero />
        </aside>

        {/* Right Side: Step-dependent Content */}
        <main className="flex-1 md:overflow-hidden relative bg-white">
          {step === "selection" ? (
            <div className="flex flex-col md:flex-row h-full animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Calendar Pane */}
              <div className="flex-1 p-6 md:p-10 border-b md:border-b-0 md:border-r border-black/10 flex justify-center">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>

              {/* Time Slots Pane */}
              <div className="w-full md:w-[280px] p-6 md:p-8 flex justify-center bg-[#FBFBFB]">
                <TimeSlotPicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  onConfirm={handleNextStep}
                />
              </div>
            </div>
          ) : (
            <div className="h-full p-8 md:p-12 flex items-start justify-center bg-white overflow-y-auto">
              <BookingForm
                onBack={handleBack}
                onConfirm={handleConfirm}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
