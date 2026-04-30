import dayjs from 'dayjs';
import type { day as DayRecord, rdv } from '../../../generated/prisma/client.ts';
import type { Dayjs } from 'dayjs';
import { WeekSelector } from '#/components/WeeklyView/WeekSelector.tsx';
import { WeekDayHeader } from '#/components/WeeklyView/WeekDayHeader.tsx';
import { WeekTimeGrid } from '#/components/WeeklyView/WeekTimeGrid.tsx';
import { DAY_NAMES } from '#/components/WeeklyView/weeklyViewConstants.ts';

type DayWithRdv = (DayRecord & { rdv: rdv[] }) | null;

interface WeeklyViewProps {
  weekDays: DayWithRdv[];
  monday: Dayjs;
  isLoading?: boolean;
}

function isDateToday(date: Dayjs, today: Dayjs): boolean {
  return (
    date.date() === today.date() &&
    date.month() === today.month() &&
    date.year() === today.year()
  );
}

export function WeeklyView({ weekDays, monday, isLoading = false }: WeeklyViewProps) {
  const today = dayjs();
  const checkIsToday = (date: Dayjs) => isDateToday(date, today);

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0">
      <WeekSelector isLoading={isLoading} />

      <div className="flex-1 flex flex-col min-h-0 border border-[#E7E5E4] rounded-xl overflow-hidden">
        <div className="shrink-0 flex border-b border-[#E7E5E4] bg-[#FFFBF5]">
          <div className="w-14 shrink-0" />
          <div className="grid grid-cols-7 flex-1">
            {weekDays.map((_, i) => {
              const date = monday.add(i, 'day');
              return (
                <WeekDayHeader
                  key={i}
                  date={date}
                  dayName={DAY_NAMES[i]}
                  isToday={checkIsToday(date)}
                />
              );
            })}
          </div>
        </div>

        <WeekTimeGrid
          weekDays={weekDays}
          monday={monday}
          isDateToday={checkIsToday}
        />
      </div>
    </div>
  );
}
