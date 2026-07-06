import { Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMondayOf } from '#/utils/dateUtils.ts';
import { CalendarDatePickerButton } from '#/components/CalendarDatePickerButton.tsx';

type PeriodUnit = 'week' | 'month';

interface PeriodSelectorProps {
  unit: PeriodUnit;
  isLoading?: boolean;
}

function formatPeriodLabel(unit: PeriodUnit, day: Dayjs): string {
  if (unit === 'month') return day.format('MMMM YYYY');

  const monday = getMondayOf(day);
  const sunday = monday.add(6, 'day');

  return monday.month() === sunday.month()
    ? `${monday.format('D')} — ${sunday.format('D MMMM YYYY')}`
    : `${monday.format('D MMMM')} — ${sunday.format('D MMMM YYYY')}`;
}

export function PeriodSelector({ unit, isLoading = false }: PeriodSelectorProps) {
  const day = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  const goToPrevious = () => setDay(unit === 'week' ? day.subtract(7, 'day') : day.subtract(1, 'month'));
  const goToNext = () => setDay(unit === 'week' ? day.add(7, 'day') : day.add(1, 'month'));

  return (
    <div className="flex items-center justify-between py-3 px-2">
      <button
        type="button"
        onClick={goToPrevious}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} className="text-[#78716C]" />
      </button>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-[#1C1917] capitalize">{formatPeriodLabel(unit, day)}</p>
        {isLoading && <Spin size="small" />}
        <CalendarDatePickerButton selectedDay={day} onSelectDay={setDay} />
      </div>
      <button
        type="button"
        onClick={goToNext}
        className="p-2 rounded-full hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <ChevronRight size={18} className="text-[#78716C]" />
      </button>
    </div>
  );
}
