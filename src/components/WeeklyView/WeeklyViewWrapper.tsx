import { useCalendarStore } from '#/store/calendarStore.ts';
import { DataState } from '#/components/DataState.tsx';
import { useGetWeeklyRdv } from '#/services/calendarService.ts';
import { WeeklyView } from '#/components/WeeklyView/WeeklyView.tsx';
import { getMondayOf } from '#/utils/dateUtils.ts';

export function WeeklyViewWrapper() {
  const day = useCalendarStore((state) => state.day);

  const monday = getMondayOf(day);

  const { data = [], isLoading, isError } = useGetWeeklyRdv(monday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const slotDate = monday.add(i, 'day').format('YYYY-MM-DD');
    return data.find((d) => new Date(d.date).toISOString().slice(0, 10) === slotDate) ?? null;
  });

  return (
    <DataState isError={isError}>
      <WeeklyView weekDays={weekDays} monday={monday} isLoading={isLoading} />
    </DataState>
  );
}
