import React, { useState } from 'react';

interface TimeSlotPickerProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  onConfirm: () => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  selectedDate, 
  selectedTime, 
  onTimeSelect,
  onConfirm 
}) => {
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00"
  ];

  const formatTime = (time: string) => {
    if (timeFormat === '24h') return time;
    
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formattedDate = `${DAYS[selectedDate.getDay()]} ${selectedDate.getDate()}`;

  return (
    <div className="flex flex-col w-full h-full max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-base font-semibold text-black font-sans">
          {formattedDate}
        </h2>
        <div className="flex items-center p-0.5 bg-[#F5F5F7] rounded-[4px] border border-black/5 gap-0.5 font-mono">
          <button 
            onClick={() => setTimeFormat('12h')}
            className={`px-2.5 py-1 text-[11px] font-semibold transition-all rounded-[2px] cursor-pointer ${
              timeFormat === '12h' 
                ? 'bg-white text-black shadow-sm' 
                : 'bg-transparent text-black/40 hover:text-black'
            }`}
          >
            12H
          </button>
          <button 
            onClick={() => setTimeFormat('24h')}
            className={`px-2.5 py-1 text-[11px] font-semibold transition-all rounded-[2px] cursor-pointer ${
              timeFormat === '24h' 
                ? 'bg-white text-black shadow-sm' 
                : 'bg-transparent text-black/40 hover:text-black'
            }`}
          >
            24H
          </button>
        </div>
      </div>

      {/* Slots List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-2 max-h-[460px]">
        {timeSlots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <div key={time} className="flex gap-2 group transition-all duration-200">
              <button
                onClick={() => onTimeSelect(time)}
                className={`
                  flex-1 h-[42px] border rounded-[4px] text-sm font-medium font-mono transition-all duration-150 cursor-pointer
                  ${isSelected 
                    ? 'border-[#1A5FED] bg-[#1A5FED]/5 text-[#1A5FED] font-semibold shadow-sm' 
                    : 'border-black/10 bg-white text-black/80 hover:border-[#1A5FED]/40 hover:text-[#1A5FED]'
                  }
                `}
              >
                {formatTime(time)}
              </button>
              {isSelected && (
                <button
                  onClick={onConfirm}
                  className="w-20 h-[42px] bg-black text-white rounded-[4px] font-medium text-xs uppercase tracking-wider shadow-sm hover:bg-black/90 active:scale-95 transition-all cursor-pointer font-mono"
                >
                  NEXT →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
