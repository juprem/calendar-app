import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { DailyView } from '#/components/DailyView/DailyView.tsx';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { DataState } from '#/components/DataState/DataState.tsx';
import { useGetDailyRdv } from '#/services/calendarService.ts';

export function DailyViewWrapper() {
  const today = useCalendarStore((state) => state.day);
  const { data, isLoading, isError } = useGetDailyRdv(today);

  const orderedRdv = data?.rdv.toSorted((prev, next) => {
    const [aH, aM] = getHourAndMinute(prev.startHour);
    const [bH, bM] = getHourAndMinute(next.startHour);
    return aH === bH ? aM - bM : aH - bH;
  }) ?? [];

  return (
    <DataState isError={isError}>
      <DailyView isLoading={isLoading} rdvs={orderedRdv} isoDate={today.format('YYYY-MM-DD')} />
    </DataState>
  );
}
