import { useGetDailyRdv } from '#/services/calendarService.ts';
import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { DailyView } from '#/components/DailyView/DailyView.tsx';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { DataState } from '#/components/DataState.tsx';

export function DailyViewWrapper() {
  const today = useCalendarStore((state) => state.day);
  const { data, isLoading, isError } = useGetDailyRdv(today);

  const orderedRdv = data?.rdv.sort((prev, next) => {
    const [aH, aM] = getHourAndMinute(prev.start_hour);
    const [bH, bM] = getHourAndMinute(next.start_hour);
    return aH === bH ? aM - bM : aH - bH;
  }) ?? [];

  return (
    <DataState isError={isError}>
      <DailyView isLoading={isLoading} rdvs={orderedRdv} isoDate={today.format('YYYY-MM-DD')} />
    </DataState>
  );
}
