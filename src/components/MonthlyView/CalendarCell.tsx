import type { rdv } from '../../../generated/prisma/client.ts';

interface CalendarCellProps {
  dayNum: number;
  rdvs: rdv[];
  isToday: boolean;
}

const MAX_VISIBLE = 3;

export function CalendarCell({ dayNum, rdvs, isToday }: CalendarCellProps) {
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
          <div
            key={rdv.id}
            title={`${rdv.start_hour} – ${rdv.end_hour}  ${rdv.name}`}
            className="text-xs bg-[#EA580C] text-white rounded px-1 py-0.5 truncate"
          >
            <span className="font-semibold">{rdv.start_hour}</span>{' '}
            {rdv.name}
          </div>
        ))}

        {overflow > 0 && (
          <p className="text-xs text-[#78716C] pl-1">+{overflow} autre{overflow > 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}
