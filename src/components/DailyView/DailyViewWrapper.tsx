import { useGetDailyRdv } from '#/services/calendarService.ts';
import { getHourAndMinute } from '#/components/DailyView/utils/getHoursAndMinute.ts';
import { DailyView } from '#/components/DailyView/DailyView.tsx';
import { useCalendarStore } from '#/store/calendarStore.ts';


export function DailyViewWrapper() {
  const today = useCalendarStore((state) => state.day);
  
  const { data, isLoading } = useGetDailyRdv(today);

  if (isLoading) {
    return <div className="p-8">Loading</div>;
  }

  const orderedRdv = data?.rdv.sort((prev, next) => {
    const [aH, aM] = getHourAndMinute(prev.start_hour);
    const [bH, bM] = getHourAndMinute(next.start_hour);

    return aH == bH ? aM - bM : aH - bH;
  }) || [];

  return <DailyView rdvs={orderedRdv} />;
}
