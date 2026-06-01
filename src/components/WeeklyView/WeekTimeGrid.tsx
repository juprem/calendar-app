import { useEffect, useRef } from 'react';
import type { day as DayRecord, rdv } from '../../../generated/prisma/client.ts';
import type { Dayjs } from 'dayjs';
import { WeekDayColumn } from '#/components/WeeklyView/WeekDayColumn.tsx';
import { HOUR_HEIGHT, HOURS, START_HOUR } from '#/components/WeeklyView/weeklyViewConstants.ts';

type DayWithRdv = (DayRecord & { rdv: rdv[] }) | null;

interface WeekTimeGridProps {
  weekDays: DayWithRdv[];
  monday: Dayjs;
  isDateToday: (date: Dayjs) => boolean;
}

const INITIAL_SCROLL_HOUR = 8;

export function WeekTimeGrid({ weekDays, monday, isDateToday }: WeekTimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (INITIAL_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto flex min-h-0">
      <div className="w-14 shrink-0 bg-white">
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex items-start justify-end pr-2 pt-1 border-t border-[#E7E5E4] first:border-t-0"
            style={{ height: HOUR_HEIGHT }}
          >
            <span className="text-xs text-[#78716C] leading-none">
              {String(h).padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {weekDays.map((dayData, i) => (
          <WeekDayColumn
            key={i}
            rdvs={dayData?.rdv ?? []}
            isToday={isDateToday(monday.add(i, 'day'))}
          />
        ))}
      </div>
    </div>
  );
}
