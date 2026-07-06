import { useState } from 'react';
import { DatePicker } from 'antd';
import { CalendarDays } from 'lucide-react';
import type { Dayjs } from 'dayjs';

interface CalendarDatePickerButtonProps {
  selectedDay: Dayjs;
  onSelectDay: (selectedDay: Dayjs) => void;
}

export function CalendarDatePickerButton({ selectedDay, onSelectDay }: CalendarDatePickerButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handlePickDay = (pickedDay: Dayjs | null) => {
    if (pickedDay) onSelectDay(pickedDay);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
        aria-label="Choisir une date"
      >
        <CalendarDays size={18} className="text-[#78716C]" />
      </button>
      <DatePicker
        value={selectedDay}
        onChange={handlePickDay}
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        format="DD/MM/YYYY"
        allowClear={false}
        className="absolute inset-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
