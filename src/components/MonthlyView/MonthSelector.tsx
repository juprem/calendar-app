import { Spin } from 'antd';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  isLoading?: boolean;
}

export function MonthSelector({ isLoading = false }: MonthSelectorProps) {
  const day = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  return (
    <div className="flex items-center justify-between py-3 px-2">
      <button
        type="button"
        onClick={() => setDay(day.subtract(1, 'month'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} className="text-[#78716C]" />
      </button>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-[#1C1917] capitalize">{day.format('MMMM YYYY')}</p>
        {isLoading && <Spin size="small" />}
      </div>
      <button
        type="button"
        onClick={() => setDay(day.add(1, 'month'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronRight size={18} className="text-[#78716C]" />
      </button>
    </div>
  );
}
