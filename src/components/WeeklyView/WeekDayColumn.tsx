import type { rdv } from '../../../generated/prisma/client.ts';
import { WeekRdvBlock } from '#/components/WeeklyView/WeekRdvBlock.tsx';
import { getHourAndMinute } from '#/components/DailyView/utils/getHoursAndMinute.ts';
import { HOUR_HEIGHT, HOURS, START_HOUR } from '#/components/WeeklyView/weeklyViewConstants.ts';

interface WeekDayColumnProps {
  rdvs: rdv[];
  isToday: boolean;
}

function computeBlockPosition(rdv: rdv): { top: number; height: number } {
  const [startH, startM] = getHourAndMinute(rdv.start_hour);
  const [endH, endM] = getHourAndMinute(rdv.end_hour);
  const top = Math.max((startH - START_HOUR) * HOUR_HEIGHT + (startM / 60) * HOUR_HEIGHT, 0);
  const durationMin = (endH - startH) * 60 + (endM - startM);
  const height = Math.max((durationMin / 60) * HOUR_HEIGHT, 24);
  return { top, height };
}

export function WeekDayColumn({ rdvs, isToday }: WeekDayColumnProps) {
  const totalHeight = HOURS.length * HOUR_HEIGHT;

  return (
    <div className={`border-l border-[#E7E5E4] ${isToday ? 'bg-[#FFFBEB]' : 'bg-white'}`}>
      <div className="relative" style={{ height: totalHeight }}>
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute w-full border-t border-[#E7E5E4]"
            style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
          />
        ))}
        {rdvs.map((rdv) => {
          const { top, height } = computeBlockPosition(rdv);
          return <WeekRdvBlock key={rdv.id} rdv={rdv} top={top} height={height} />;
        })}
      </div>
    </div>
  );
}
