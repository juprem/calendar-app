import type { Dayjs } from 'dayjs';

interface WeekDayHeaderProps {
  date: Dayjs;
  dayName: string;
  isToday: boolean;
}

export function WeekDayHeader({ date, dayName, isToday }: WeekDayHeaderProps) {
  return (
    <div className="py-2 text-center border-l border-[#E7E5E4] first:border-l-0">
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          isToday ? 'text-[#EA580C]' : 'text-[#78716C]'
        }`}
      >
        {dayName}
      </p>
      <div className="flex justify-center mt-1">
        <span
          className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
            isToday ? 'bg-[#F59E0B] text-white' : 'text-[#1C1917]'
          }`}
        >
          {date.date()}
        </span>
      </div>
    </div>
  );
}
