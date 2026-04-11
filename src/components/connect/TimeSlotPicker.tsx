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

  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col w-full h-full max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-[20px] font-medium text-brand-black">
          {formattedDate}
        </h2>
        <div className="flex items-center p-1 bg-[#F1F1F1] rounded-[10px] gap-0.5">
          <button 
            onClick={() => setTimeFormat('12h')}
            className={`px-3 py-1.5 text-[12px] font-bold transition-all rounded-[8px] ${
              timeFormat === '12h' 
                ? 'bg-white text-brand-black shadow-sm' 
                : 'bg-transparent text-brand-black/30'
            }`}
          >
            12h
          </button>
          <button 
            onClick={() => setTimeFormat('24h')}
            className={`px-3 py-1.5 text-[12px] font-bold transition-all rounded-[8px] ${
              timeFormat === '24h' 
                ? 'bg-white text-brand-black shadow-sm' 
                : 'bg-transparent text-brand-black/30'
            }`}
          >
            24h
          </button>
        </div>
      </div>

      {/* Slots List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 mb-2 custom-scrollbar max-h-[480px]">
        {timeSlots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <div key={time} className="flex gap-2 group transition-all duration-300">
              <button
                onClick={() => onTimeSelect(time)}
                className={`
                  flex-1 h-[46px] border rounded-[8px] text-[15px] font-medium transition-all duration-200
                  ${isSelected 
                    ? 'border-brand-blue bg-white text-brand-blue shadow-sm' 
                    : 'border-[#E8E9ED] bg-white text-brand-black hover:border-brand-blue/40'
                  }
                `}
              >
                {formatTime(time)}
              </button>
              {isSelected && (
                <button
                  onClick={onConfirm}
                  className="w-24 h-[46px] bg-brand-blue text-white rounded-[8px] font-bold text-[14px] shadow-[0_4px_12px_rgba(27,95,237,0.2)] animate-in slide-in-from-right-4 fade-in duration-300 scale-100 active:scale-95"
                >
                  Next
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
