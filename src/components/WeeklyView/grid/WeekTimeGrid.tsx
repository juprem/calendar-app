import { useEffect, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { WeekDayColumn } from './day/WeekDayColumn.tsx';
import { WeekDayHeader } from './day/WeekDayHeader.tsx';
import { HourLabel } from './HourLabel.tsx';
import { HOUR_HEIGHT, HOURS, START_HOUR, END_HOUR, DAY_NAMES } from './weeklyViewConstants.ts';
import { useDragToCreate } from './hooks/useDragToCreate.ts';
import type { DayWithRdvs, RdvWithContact } from '#/domain/calendar/models.ts';

interface WeekTimeGridProps {
  weekDays: DayWithRdvs[];
  monday: Dayjs;
  isDateToday: (date: Dayjs) => boolean;
  onRdvClick: (rdv: RdvWithContact, isoDate: string) => void;
  onCreateRdv: (isoDate: string, startTime: string, endTime: string) => void;
}

interface HoverTime {
  y: number;
  pillX: number;
  label: string;
}

const INITIAL_SCROLL_HOUR = 8;
const GUTTER_WIDTH = 56;

function formatHoverTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, '0')}`;
}

function computePosition(
  e: React.MouseEvent<HTMLDivElement>,
  rect: DOMRect,
): { minutes: number; columnIndex: number } {
  const y = e.clientY - rect.top;
  const rawMinutes = (y / HOUR_HEIGHT) * 60 + START_HOUR * 60;
  const snapped = Math.round(rawMinutes / 15) * 15;
  const minutes = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60 - 15, snapped));
  const columnWidth = (rect.width - GUTTER_WIDTH) / 7;
  const relativeX = e.clientX - rect.left - GUTTER_WIDTH;
  const columnIndex = Math.max(0, Math.min(6, Math.floor(relativeX / columnWidth)));

  return { minutes, columnIndex };
}

export function WeekTimeGrid({ weekDays, monday, isDateToday, onRdvClick, onCreateRdv }: WeekTimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<HoverTime | null>(null);
  const { drag, startDrag, moveDrag, endDrag } = useDragToCreate({ monday, onCreateRdv });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (INITIAL_SCROLL_HOUR - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    startDrag(computePosition(e, rect));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const pos = computePosition(e, rect);
    if (drag) { moveDrag(pos); return; }

    const columnWidth = (rect.width - GUTTER_WIDTH) / 7;

    setHoverTime({
      y: (pos.minutes / 60) * HOUR_HEIGHT,
      pillX: pos.columnIndex * columnWidth + 6,
      label: formatHoverTime(pos.minutes),
    });
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
      <div className="sticky top-0 z-20 flex bg-[#FFFBF5] border-b border-[#E7E5E4]">
        <div className="w-14 shrink-0" />
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((_, i) => {
            const date = monday.add(i, 'day');

            return (
              <WeekDayHeader key={date.toString()} date={date} dayName={DAY_NAMES[i]} isToday={isDateToday(date)} />
            );
          })}
        </div>
      </div>

      <div
        role="button"
        ref={gridRef}
        tabIndex={0}
        className="relative flex select-none cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={() => { if (!drag) setHoverTime(null); }}
      >
        <div className="w-14 shrink-0 bg-white">
          {HOURS.map((h) => <HourLabel key={h} hour={h} />)}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((dayData, i) => {
            const columnDate = monday.add(i, 'day');
            return (
              <WeekDayColumn
                key={columnDate.toString()}
                rdvs={dayData?.rdv ?? []}
                isToday={isDateToday(columnDate)}
                isoDate={columnDate.format('YYYY-MM-DD')}
                onRdvClick={onRdvClick}
                selection={drag?.columnIndex === i
                  ? { startMinutes: drag.startMinutes, endMinutes: drag.currentMinutes }
                  : null}
              />
            );
          })}
        </div>

        {!drag && hoverTime && (
          <div
            className="absolute pointer-events-none z-30"
            style={{ top: hoverTime.y, left: GUTTER_WIDTH, right: 0 }}
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
