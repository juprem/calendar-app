import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';

interface CalendarCellProps {
  dayNum: number;
  rdvs: RdvWithContact[];
  isToday: boolean;
  onRdvClick: (rdv: RdvWithContact, dayNum: number) => void;
  onOverflowClick: (rdvs: RdvWithContact[], dayNum: number) => void;
}

const MAX_VISIBLE = 3;

export function CalendarCell({ dayNum, rdvs, isToday, onRdvClick, onOverflowClick }: CalendarCellProps) {
  const contactFilter = useCalendarStore((s) => s.contactFilter);
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
        {visible.map((rdv) => {
          const isDimmed = contactFilter !== null && rdv.contact_id !== contactFilter;
          const contactName = rdv.contact
            ? `${rdv.contact.firstname} ${rdv.contact.lastname}`
            : null;
          const typeStyle = getRdvTypeStyle(rdv.rdv_type);
          return (
            <button
              key={rdv.id}
              type="button"
              onClick={() => onRdvClick(rdv, dayNum)}
              title={`${rdv.start_hour} – ${rdv.end_hour}  ${rdv.name}${rdv.additional_infos ? ` · ${rdv.additional_infos}` : ''}`}
              className={`w-full text-left text-xs rounded px-1 py-0.5 transition-opacity cursor-pointer flex items-center gap-1 ${typeStyle.block} ${isDimmed ? 'opacity-20 pointer-events-none' : ''}`}
            >
              <span className="font-semibold shrink-0">{rdv.start_hour}</span>
              <span className="flex-1 truncate">{contactName ?? rdv.name}</span>
              <RdvStatusIcon isConfirmed={rdv.is_confirmed} size={10} variant="onBlock" onBlockIconClass={typeStyle.blockIcon} />
            </button>
          );
        })}

        {overflow > 0 && (
          <button
            type="button"
            onClick={() => onOverflowClick(rdvs, dayNum)}
            className="text-xs text-[#92400E] pl-1 hover:underline cursor-pointer"
          >
            +{overflow} autre{overflow > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
