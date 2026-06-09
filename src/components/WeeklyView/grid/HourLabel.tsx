import { HOUR_HEIGHT, QUARTER_HEIGHT } from './weeklyViewConstants.ts';

interface HourLabelProps {
  hour: number;
}

export function HourLabel({ hour }: HourLabelProps) {
  return (
    <div
      className="relative border-t border-[#E7E5E4] first:border-t-0"
      style={{ height: HOUR_HEIGHT }}
    >
      <span className="absolute right-2 top-1 text-xs text-[#78716C] leading-none">
        {String(hour).padStart(2, '0')}:00
      </span>
      <span
        className="absolute right-2 text-[10px] text-[#B8B3AE] leading-none"
        style={{ top: QUARTER_HEIGHT * 2 + 2 }}
      >
        :30
      </span>
    </div>
  );
}
