"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // View date defaults to the month of the selected date, or current month
  const [viewDate, setViewDate] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = viewDate.toLocaleString("default", { month: "long" });
  const year = viewDate.getFullYear();

  // Can we navigate backwards? Only if viewing month > current month
  const canGoPrev = viewDate.getTime() > currentMonthStart.getTime();

  // Maximum booking horizon: 3 months ahead
  const maxMonthAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const canGoNext = viewDate.getTime() < maxMonthAhead.getTime();

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    }
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    return (
      now.getDate() === day &&
      now.getMonth() === viewDate.getMonth() &&
      now.getFullYear() === viewDate.getFullYear()
    );
  };

  const isWeekday = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay();
    return d !== 0 && d !== 6; // Mon-Fri are available
  };

  const isPast = (day: number) => {
    const endOfDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 23, 59, 59).getTime();
    return endOfDay < now.getTime();
  };

  return (
    <div className="flex flex-col w-full max-w-[460px]">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-semibold text-black font-sans">
          {monthName} <span className="text-black/40 font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-1.5 font-mono">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className={`w-8 h-8 rounded-[6px] border flex items-center justify-center transition-colors cursor-pointer ${
              canGoPrev
                ? "border-black/10 text-black hover:bg-black/5"
                : "border-black/5 text-black/20 cursor-not-allowed bg-transparent"
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className={`w-8 h-8 rounded-[6px] border flex items-center justify-center transition-colors cursor-pointer ${
              canGoNext
                ? "border-black/10 text-black hover:bg-black/5"
                : "border-black/5 text-black/20 cursor-not-allowed bg-transparent"
            }`}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Legend */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-[11px] font-bold text-black/40 py-1.5 tracking-wider uppercase font-mono"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="w-full aspect-square" />
        ))}

        {days.map((day) => {
          const active = isSelected(day);
          const today = isToday(day);
          const past = isPast(day);
          const weekday = isWeekday(day);
          const isAvailable = !past && weekday;

          return (
            <div key={day} className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isAvailable) {
                    onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                  }
                }}
                disabled={!isAvailable}
                className={`
                  w-full aspect-square rounded-[6px] text-sm sm:text-base font-medium font-sans transition-all duration-150
                  flex items-center justify-center cursor-pointer select-none
                  ${
                    active
                      ? "bg-[#1A5FED] text-white shadow-md font-semibold scale-102"
                      : isAvailable
                        ? "text-black bg-[#F7F7F7] hover:bg-[#1A5FED]/10 hover:text-[#1A5FED] border border-black/5"
                        : "text-black/25 cursor-not-allowed bg-transparent"
                  }
                `}
              >
                {day}
              </button>
              {today && !active && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1A5FED] rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
