import { useEffect, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { WeekDayColumn } from '#/components/WeeklyView/WeekDayColumn.tsx';
import { HOUR_HEIGHT, HOURS, QUARTER_HEIGHT, START_HOUR, END_HOUR } from '#/components/WeeklyView/weeklyViewConstants.ts';
import type { DayWithRdv, RdvWithContact } from '#/models/CalendarModel.ts';

interface WeekTimeGridProps {
  weekDays: DayWithRdv[];
  monday: Dayjs;
  isDateToday: (date: Dayjs) => boolean;
  onRdvClick: (rdv: RdvWithContact, isoDate: string) => void;
}

interface HoverTime {
  y: number;
  pillX: number;
  label: string;
}

const INITIAL_SCROLL_HOUR = 8;

function formatHoverTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

export function WeekTimeGrid({ weekDays, monday, isDateToday, onRdvClick }: WeekTimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<HoverTime | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (INITIAL_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const totalMinutes = (y / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const snapped = Math.round(totalMinutes / 15) * 15;
    const clamped = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, snapped));

    const gutterWidth = 56;
    const columnWidth = (rect.width - gutterWidth) / 7;
    const relativeX = e.clientX - rect.left - gutterWidth;
    const columnIndex = Math.max(0, Math.min(6, Math.floor(relativeX / columnWidth)));

    setHoverTime({
      y: (clamped - START_HOUR * 60) / 60 * HOUR_HEIGHT,
      pillX: columnIndex * columnWidth + 6,
      label: formatHoverTime(clamped),
    });
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
      <div
        ref={gridRef}
        className="relative flex"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        <div className="w-14 shrink-0 bg-white">
          {HOURS.map((h) => (
            <div
              key={h}
              className="relative border-t border-[#E7E5E4] first:border-t-0"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="absolute right-2 top-1 text-xs text-[#78716C] leading-none">
                {String(h).padStart(2, '0')}:00
              </span>
              <span
                className="absolute right-2 text-[10px] text-[#B8B3AE] leading-none"
                style={{ top: QUARTER_HEIGHT * 2 + 2 }}
              >
                :30
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((dayData, i) => {
            const columnDate = monday.add(i, 'day');
            return (
              <WeekDayColumn
                key={i}
                rdvs={dayData?.rdv ?? []}
                isToday={isDateToday(columnDate)}
                isoDate={columnDate.format('YYYY-MM-DD')}
                onRdvClick={onRdvClick}
              />
            );
          })}
        </div>

        {hoverTime && (
          <div
            className="absolute pointer-events-none z-30"
            style={{ top: hoverTime.y, left: 56, right: 0 }}
          >
            <div className="relative">
              <div className="border-t border-[#92400E] opacity-50" />
              <div
                className="absolute -translate-y-1/2 bg-[#92400E] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded leading-none whitespace-nowrap z-40"
                style={{ left: hoverTime.pillX }}
              >
                {hoverTime.label}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
