import { useCalendarStore } from '#/store/calendarStore.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthSelector() {
  const day = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  return (
    <div className="flex items-center justify-between py-4 px-2 border-b border-[#E7E5E4]">
      <button
        onClick={() => setDay(day.subtract(1, 'month'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} className="text-[#78716C]" />
      </button>
      <p className="text-2xl font-bold text-[#1C1917] capitalize">{day.format('MMMM YYYY')}</p>
      <button
        onClick={() => setDay(day.add(1, 'month'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronRight size={20} className="text-[#78716C]" />
      </button>
    </div>
  );
}
