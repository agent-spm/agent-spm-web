import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [viewDate] = useState(new Date(2026, 3, 1)); // April 2026

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === viewDate.getMonth() && 
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === viewDate.getMonth() && 
           today.getFullYear() === viewDate.getFullYear();
  };

  const isWeekday = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay();
    return d !== 0 && d !== 6;
  };

  const isPast = (day: number) => {
    const today = new Date(2026, 3, 11).getTime();
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getTime();
    return current <= today;
  };

  return (
    <div className="flex flex-col w-full max-w-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <h2 className="text-xl font-semibold text-black font-sans">
          {monthName} <span className="text-black/40 font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-[4px] border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-[4px] border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-[11px] font-bold text-black/40 py-2 tracking-wider uppercase font-mono">
            {day}
          </div>
        ))}

        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="w-full aspect-square" />
        ))}

        {days.map((day) => {
          const active = isSelected(day);
          const today = isToday(day);
          const pastValue = isPast(day);
          const weekday = isWeekday(day);
          const isAvailable = !pastValue && weekday;
          
          return (
            <div key={day} className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => isAvailable && onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                disabled={!isAvailable}
                className={`
                  w-full aspect-square rounded-[4px] text-sm sm:text-base font-medium font-sans transition-all duration-150
                  flex items-center justify-center cursor-pointer
                  ${active 
                    ? 'bg-[#1A5FED] text-white shadow-sm font-semibold' 
                    : isAvailable 
                      ? 'text-black bg-[#F7F7F7] hover:bg-[#1A5FED]/10 hover:text-[#1A5FED]' 
                      : 'text-black/25 cursor-not-allowed bg-transparent'
                  }
                `}
              >
                {day}
              </button>
              {today && !active && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A5FED] rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
