import { useCalendarStore } from '#/store/calendarStore.ts';
import { useGetMonthlyRdv } from '#/services/calendarService.ts';
import { MonthlyView } from '#/components/MonthlyView/MonthlyView.tsx';

export function MonthlyViewWrapper() {
  const day = useCalendarStore((state) => state.day);
  const { data, isLoading } = useGetMonthlyRdv(day.month() + 1, day.year());

  return <MonthlyView days={data ?? []} currentDay={day} isLoading={isLoading} />;
}
