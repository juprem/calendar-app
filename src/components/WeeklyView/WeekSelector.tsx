import { Spin } from 'antd';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekSelectorProps {
  isLoading?: boolean;
}

export function WeekSelector({ isLoading = false }: WeekSelectorProps) {
  const day = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  const dow = day.day();
  const monday = day.subtract(dow === 0 ? 6 : dow - 1, 'day');
  const sunday = monday.add(6, 'day');

  const label =
    monday.month() === sunday.month()
      ? `${monday.format('D')} — ${sunday.format('D MMMM YYYY')}`
      : `${monday.format('D MMMM')} — ${sunday.format('D MMMM YYYY')}`;

  return (
    <div className="flex items-center justify-between py-3 px-2 border-b border-[#E7E5E4]">
      <button
        onClick={() => setDay(day.subtract(7, 'day'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} className="text-[#78716C]" />
      </button>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-[#1C1917] capitalize">{label}</p>
        {isLoading && <Spin size="small" />}
      </div>
      <button
        onClick={() => setDay(day.add(7, 'day'))}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronRight size={18} className="text-[#78716C]" />
      </button>
    </div>
  );
}
