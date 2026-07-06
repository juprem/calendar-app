import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { WeekRdvBlock } from './WeekRdvBlock/WeekRdvBlock.tsx';
import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { HOUR_HEIGHT, HOURS, QUARTERS, QUARTER_HEIGHT, START_HOUR } from '../weeklyViewConstants.ts';

interface WeekDayColumnProps {
  rdvs: RdvWithContact[];
  isToday: boolean;
  isoDate: string;
  onRdvClick: (rdv: RdvWithContact, isoDate: string) => void;
  selection?: { startMinutes: number; endMinutes: number } | null;
}

function computeSelectionStyle(sel: { startMinutes: number; endMinutes: number }) {
  return {
    top: (Math.min(sel.startMinutes, sel.endMinutes) / 60) * HOUR_HEIGHT,
    height: Math.max(
      (Math.abs(sel.endMinutes - sel.startMinutes) / 60) * HOUR_HEIGHT,
      QUARTER_HEIGHT,
    ),
  };
}

function computeBlockPosition(rdv: RdvWithContact): { top: number; height: number } {
  const [startH, startM] = getHourAndMinute(rdv.startHour);
  const [endH, endM] = getHourAndMinute(rdv.endHour);
  const top = Math.max((startH - START_HOUR) * HOUR_HEIGHT + (startM / 60) * HOUR_HEIGHT, 0);
  const durationMin = (endH - startH) * 60 + (endM - startM);
  const height = Math.max((durationMin / 60) * HOUR_HEIGHT, QUARTER_HEIGHT);
  return { top, height };
}

export function WeekDayColumn({ rdvs, isToday, isoDate, onRdvClick, selection }: WeekDayColumnProps) {
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  return (
    <div className={`border-l border-[#E7E5E4] ${isToday ? 'bg-[#FFFBEB]' : 'bg-white'}`}>
      <div className="relative" style={{ height: totalHeight }}>
        {HOURS.flatMap((h) => [
          <div
            key={`h-${h}`}
            className="absolute w-full border-t border-[#E7E5E4]"
            style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
          />,
          ...QUARTERS.map((q) => (
            <div
              key={`q-${h}-${q}`}
              className={`absolute w-full border-t ${
                q === 2
                  ? 'border-[#ECEAE6]'
                  : 'border-dashed border-[#F0EDE8]'
              }`}
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT + q * QUARTER_HEIGHT }}
            />
          )),
        ])}
        {selection && (
          <div
            className="absolute inset-x-0.5 bg-amber-400/25 border border-amber-400/60 rounded pointer-events-none z-10"
            style={computeSelectionStyle(selection)}
          />
        )}
        {rdvs.map((rdv) => {
          const { top, height } = computeBlockPosition(rdv);
          return (
            <WeekRdvBlock
              key={rdv.id}
              rdv={rdv}
              top={top}
              height={height}
              onClick={() => onRdvClick(rdv, isoDate)}
            />
          );
        })}
      </div>
    </div>
  );
}
