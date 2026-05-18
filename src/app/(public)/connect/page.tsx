'use client';

import React, { useState } from 'react';
import { ConnectHero } from '@/components/connect/ConnectHero';
import { Calendar } from '@/components/connect/Calendar';
import { TimeSlotPicker } from '@/components/connect/TimeSlotPicker';
import { BookingForm } from '@/components/connect/BookingForm';

export default function ConnectPage() {
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 13)); // Default as per screenshot
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
      setStep('details');
    }
  };

  const handleBack = () => {
    setStep('selection');
  };

  const handleConfirm = () => {
    // Backend integration will be handled later
    console.log('Booking confirmed:', { selectedDate, selectedTime });
    alert('Booking request received (Demo only)!');
  };

  return (
    <>
      {/* Fixed Background Grid Pattern for the entire page (under navbar too) */}
      <div className="fixed inset-0 -z-10 bg-[#F5F5F5]">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1B5FED 1px, transparent 1px),
              linear-gradient(to bottom, #1B5FED 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-[1100px] min-h-0 md:h-[580px] bg-white rounded-[16px] border border-[#E8E9ED] shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden transition-all duration-500">
        
        {/* Left Side: Permanently Visible Info */}
        <aside className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-[#E8E9ED] p-6 md:p-8 bg-white z-10 shrink-0">
          <ConnectHero />
        </aside>
 
        {/* Right Side: Step-dependent Content */}
        <main className="flex-1 md:overflow-hidden relative bg-white">
          {step === 'selection' ? (
            <div className="flex flex-col md:flex-row h-full animate-in fade-in slide-in-from-right-2 duration-500">
              {/* Calendar Pane */}
              <div className="flex-1 p-6 md:p-12 border-b md:border-b-0 md:border-r border-[#E8E9ED] flex justify-center">
                <Calendar 
                  selectedDate={selectedDate} 
                  onDateSelect={handleDateSelect} 
                />
              </div>
 
              {/* Time Slots Pane */}
              <div className="w-full md:w-[280px] p-6 md:p-8 flex justify-center bg-white">
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
    </>
  );
}
