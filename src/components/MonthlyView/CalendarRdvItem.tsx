import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { formatContactName } from '#/utils/contactUtils.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';

interface CalendarRdvItemProps {
  rdv: RdvWithContact;
  dayNum: number;
  onRdvClick: (rdv: RdvWithContact, dayNum: number) => void;
}

export function CalendarRdvItem({ rdv, dayNum, onRdvClick }: CalendarRdvItemProps) {
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const isDimmed = contactFilter !== null && rdv.contact_id !== contactFilter;
  const contactName = rdv.contact ? formatContactName(rdv.contact, { short: true }) : null;
  const typeStyle = getRdvTypeStyle(rdv.rdv_type);

  return (
    <button
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
}
