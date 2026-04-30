import { useCalendarStore } from '#/store/calendarStore.ts';
import { useGetWeeklyRdv } from '#/services/calendarService.ts';
import { WeeklyView } from '#/components/WeeklyView/WeeklyView.tsx';

export function WeeklyViewWrapper() {
  const day = useCalendarStore((state) => state.day);

  const dayNow = day.day();
  const monday = day.subtract(dayNow === 0 ? 6 : dayNow - 1, 'day');

  const { data, isLoading } = useGetWeeklyRdv(monday.date(), monday.month() + 1, monday.year());

  const weekDays = data ?? Array(7).fill(null);

  return <WeeklyView weekDays={weekDays} monday={monday} isLoading={isLoading} />;
}
