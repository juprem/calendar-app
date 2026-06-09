import dayjs from 'dayjs';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { useGetMonthlyRdv } from '#/services/calendarService.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { MonthlyView } from '#/components/MonthlyView/MonthlyView.tsx';
import type { MonthCell } from '#/models/CalendarModel.ts';
import { DataState } from '#/components/DataState/DataState.tsx';

export function MonthlyViewWrapper() {
  const today = dayjs();
  const day = useCalendarStore((state) => state.day);
  const { data: days = [], isLoading, isError } = useGetMonthlyRdv(day.month() + 1, day.year());

  const firstOfMonth = day.startOf('month');
  const daysInMonth = day.daysInMonth();
  const firstWeekday = firstOfMonth.day();
  const leadingPad = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const totalCells = Math.ceil((leadingPad + daysInMonth) / 7) * 7;

  const rdvByDay = new Map<number, RdvWithContact[]>();
  for (const d of days) {
    rdvByDay.set(d.date.getUTCDate(), d.rdv);
  }

  const cells: MonthCell[] = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - leadingPad + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return { dayNum, rdvs: rdvByDay.get(dayNum) ?? [] };
  });

  const isToday = (dayNum: number) =>
    today.date() === dayNum &&
    today.month() === day.month() &&
    today.year() === day.year();

  return (
    <DataState isError={isError}>
      <MonthlyView cells={cells} isToday={isToday} isLoading={isLoading} year={day.year()} month={day.month() + 1} />
    </DataState>
  );
}
