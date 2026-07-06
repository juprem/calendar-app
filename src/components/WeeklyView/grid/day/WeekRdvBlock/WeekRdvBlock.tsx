import { Tooltip } from 'antd';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { useRdvPresentation } from '#/hooks/useRdvPresentation.ts';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';
import { TooltipContent } from '#/components/WeeklyView/grid/day/WeekRdvBlock/TooltipContent.tsx';

interface WeekRdvBlockProps {
  rdv: RdvWithContact;
  top: number;
  height: number;
  onClick: () => void;
}

export function WeekRdvBlock({ rdv, top, height, onClick }: WeekRdvBlockProps) {
  const { typeStyle, isDimmed, contactLabel: contactName } = useRdvPresentation(rdv, { shortContactName: true });
  const blockStyle = typeStyle.block;

  return (
    <Tooltip
      title={<TooltipContent additionalInfos={rdv.additionalInfos} phoneNumber={rdv.contact?.phoneNumber} />}
      placement="right"
    >
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
          <RdvStatusIcon
            isConfirmed={rdv.isConfirmed}
            size={10}
            variant="onBlock"
            onBlockIconClass={typeStyle.blockIcon}
          />
        </div>
        {height >= 36 && (
          <p className="opacity-60 leading-tight mt-0.5">
            {rdv.startHour} – {rdv.endHour}
          </p>
        )}
        {height >= 52 && contactName && <p className="opacity-70 leading-tight mt-0.5 truncate">{contactName}</p>}
      </div>
    </Tooltip>
  );
}
