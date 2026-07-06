import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { useRdvPresentation } from '#/hooks/useRdvPresentation.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';

interface CalendarRdvItemProps {
  rdv: RdvWithContact;
  dayNum: number;
  onRdvClick: (rdv: RdvWithContact, dayNum: number) => void;
}

export function CalendarRdvItem({ rdv, dayNum, onRdvClick }: CalendarRdvItemProps) {
  const { typeStyle, isDimmed, contactLabel: contactName } = useRdvPresentation(rdv, { shortContactName: true });

  return (
    <button
      type="button"
      onClick={() => onRdvClick(rdv, dayNum)}
      title={`${rdv.startHour} – ${rdv.endHour}  ${rdv.name}${rdv.additionalInfos ? ` · ${rdv.additionalInfos}` : ''}`}
      className={`w-full text-left text-xs rounded px-1 py-0.5 transition-opacity cursor-pointer flex items-center gap-1 ${typeStyle.block} ${isDimmed ? 'opacity-20 pointer-events-none' : ''}`}
    >
      <span className="font-semibold shrink-0">{rdv.startHour}</span>
      <span className="flex-1 truncate">{contactName ?? rdv.name}</span>
      <RdvStatusIcon isConfirmed={rdv.isConfirmed} size={10} variant="onBlock" onBlockIconClass={typeStyle.blockIcon} />
    </button>
  );
}
