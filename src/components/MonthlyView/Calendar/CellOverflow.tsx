import { useState } from 'react';
import dayjs from 'dayjs';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { RdvDayListModal } from '#/components/MonthlyView/RdvDayListModal.tsx';

interface CellOverflowProps {
  rdvs: RdvWithContact[];
  isoDate: string;
  overflow: number;
}

export function CellOverflow({ rdvs, isoDate, overflow }: CellOverflowProps) {
  const [open, setOpen] = useState(false);
  const formattedDate = dayjs(isoDate).format('dddd D MMMM YYYY');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[#92400E] pl-1 hover:underline cursor-pointer"
      >
        +{overflow} autre{overflow > 1 ? 's' : ''}
      </button>

      <RdvDayListModal
        rdvs={rdvs}
        isoDate={isoDate}
        formattedDate={formattedDate}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
