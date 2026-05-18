import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const [viewDate] = useState(new Date(2026, 3, 1)); // April 2026 as per screenshot

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
    // For demo consistency with screenshot: Today is April 11, 2026
    const today = new Date(2026, 3, 11).getTime();
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getTime();
    return current <= today;
  };

  return (
    <div className="flex flex-col w-full max-w-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 px-2">
        <h2 className="text-[24px] font-medium text-brand-black">
          {monthName} <span className="text-brand-black/40">{year}</span>
        </h2>
        <div className="flex items-center gap-10">
          <button className="text-brand-black/20 hover:text-brand-black transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-brand-black/20 hover:text-brand-black transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-x-1 sm:gap-x-4 gap-y-1 sm:gap-y-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="text-center text-[12px] font-bold text-brand-black/30 py-4 tracking-[0.2em] uppercase">
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
                onClick={() => onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                className={`
                  w-full aspect-square rounded-[8px] text-[18px] font-medium transition-all duration-200
                  flex items-center justify-center
                  ${active 
                    ? 'bg-brand-black text-white shadow-md' 
                    : isAvailable 
                      ? 'text-brand-black hover:bg-brand-blue/5 hover:text-brand-blue bg-[#EFEFEF]' 
                      : 'text-brand-black/40 hover:bg-brand-black/5'
                  }
                `}
              >
                {day}
              </button>
              {today && !active && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-black rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
