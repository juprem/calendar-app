import { Tooltip } from 'antd';
import { Calendar, Clock, User } from 'lucide-react';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { formatContactName } from '#/utils/contactUtils.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';
import dayjs from 'dayjs';

interface RdvCardProps {
  rdv: RdvWithContact;
  displayDate?: boolean;
  onClick?: () => void;
}

export function RdvCard({ rdv, displayDate = false, onClick }: RdvCardProps) {
  const { start_hour, end_hour, name, rdv_type, is_confirmed, contact, additional_infos, day } = rdv;
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const typeStyle = getRdvTypeStyle(rdv_type);
  const isDimmed = contactFilter !== null && rdv.contact_id !== contactFilter;

  const contactLabel = contact ? formatContactName(contact) : null;

  return (
    <Tooltip title={additional_infos || undefined} placement="top">
      <div
        tabIndex={0}
        role="button"
        onClick={onClick}
        className={`flex items-center bg-white rounded-xl border border-[#E7E5E4] px-4 py-3 mb-3 hover:border-[#92400E]/30 hover:shadow-sm transition-all cursor-pointer ${isDimmed ? 'opacity-30 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2 w-20 shrink-0">
          <Clock size={14} className="text-[#78716C] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1C1917] leading-tight">{start_hour}</p>
            <p className="text-xs text-[#78716C] leading-tight">{end_hour}</p>
          </div>
        </div>

        {displayDate && (<div className="flex items-center gap-2 w-20 shrink-0">
          <Calendar size={14} className="text-[#78716C] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1C1917] leading-tight">{dayjs(day.datetime).format("DD/MM")}</p>
          </div>
        </div>)}

        <div className="w-px h-8 bg-[#E7E5E4] mx-4 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-[#78716C] shrink-0" />
            <p className="font-semibold text-[#1C1917] truncate">{name}</p>
          </div>
          {contactLabel && (
            <p className="text-xs text-[#78716C] truncate mt-0.5 pl-[17px]">{contactLabel}</p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-3 shrink-0">
          {rdv_type && (
            <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${typeStyle.badge}`}>
              {rdv_type}
            </span>
          )}
          <RdvStatusIcon isConfirmed={is_confirmed} size={14} />
        </div>
      </div>
    </Tooltip>
  );
}
