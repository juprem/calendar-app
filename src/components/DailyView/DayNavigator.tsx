import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { Spin } from 'antd';

interface DayNavigatorProps {
  isLoading: boolean;
}

export function DayNavigator({ isLoading }: DayNavigatorProps) {
  const day = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  return (
    <div className="flex items-center justify-between py-4 px-2 border-b border-[#E7E5E4] mb-6">
      <button
        onClick={() => setDay(day.subtract(1, 'day'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} className="text-[#78716C]" />
      </button>
      <div className="relative text-center">
        <p className="text-sm text-[#78716C] capitalize">{day.format('dddd')}</p>
        <p className="text-2xl font-bold text-[#1C1917] capitalize">{day.format('D MMMM YYYY')}</p>
        {isLoading && (
          <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+8px)]">
            <Spin size="small" />
          </div>
        )}
      </div>
      <button
        onClick={() => setDay(day.add(1, 'day'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronRight size={20} className="text-[#78716C]" />
      </button>
    </div>
  );
}
