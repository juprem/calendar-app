import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { CalendarRdvItem } from '#/components/MonthlyView/Calendar/CalendarRdvItem.tsx';
import { CellOverflow } from '#/components/MonthlyView/Calendar/CellOverflow.tsx';

interface CalendarCellProps {
  dayNum: number;
  isoDate: string;
  rdvs: RdvWithContact[];
  isToday: boolean;
  onRdvClick: (rdv: RdvWithContact, dayNum: number) => void;
}

const MAX_VISIBLE = 3;

export function CalendarCell({ dayNum, isoDate, rdvs, isToday, onRdvClick }: CalendarCellProps) {
  const visible = rdvs.slice(0, MAX_VISIBLE);
  const overflow = rdvs.length - visible.length;

  return (
    <div className="min-h-28 p-1.5 bg-white hover:bg-[#FFFBF5] transition-colors">
      <div className="flex justify-end mb-1">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            isToday ? 'bg-[#F59E0B] text-white font-bold' : 'text-[#78716C]'
          }`}
        >
          {dayNum}
        </span>
      </div>

      <div className="space-y-0.5">
        {visible.map((rdv) => (
          <CalendarRdvItem key={rdv.id} rdv={rdv} dayNum={dayNum} onRdvClick={onRdvClick} />
        ))}

        {overflow > 0 && (
          <CellOverflow rdvs={rdvs} isoDate={isoDate} overflow={overflow} />
        )}
      </div>
    </div>
  );
}
