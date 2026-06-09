import { Tooltip } from 'antd';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { formatContactName } from '#/utils/contactUtils.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';

interface WeekRdvBlockProps {
  rdv: RdvWithContact;
  top: number;
  height: number;
  onClick: () => void;
}

export function WeekRdvBlock({ rdv, top, height, onClick }: WeekRdvBlockProps) {
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const typeStyle = getRdvTypeStyle(rdv.rdv_type);
  const blockStyle = typeStyle.block;
  const isDimmed = contactFilter !== null && rdv.contact_id !== contactFilter;
  const contactName = rdv.contact
    ? formatContactName(rdv.contact, { short: true })
    : null;

  return (
    <Tooltip title={rdv.additional_infos || undefined} placement="right">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute left-0.5 right-0.5 transition-all rounded-md text-xs px-1.5 py-1 overflow-hidden cursor-pointer z-10 ${blockStyle} ${isDimmed ? 'opacity-20 pointer-events-none' : ''}`}
        style={{ top, height }}
      >
        <div className="flex items-center justify-between gap-1 leading-tight">
          <p className="font-semibold truncate flex-1">{rdv.name}</p>
          <RdvStatusIcon isConfirmed={rdv.is_confirmed} size={10} variant="onBlock" onBlockIconClass={typeStyle.blockIcon} />
        </div>
        {height >= 36 && (
          <p className="opacity-60 leading-tight mt-0.5">
            {rdv.start_hour} – {rdv.end_hour}
          </p>
        )}
        {height >= 52 && contactName && (
          <p className="opacity-70 leading-tight mt-0.5 truncate">{contactName}</p>
        )}
      </div>
    </Tooltip>
  );
}
