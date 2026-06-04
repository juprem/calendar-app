import { useState } from 'react';
import dayjs from 'dayjs';
import { MonthSelector } from '#/components/MonthlyView/MonthSelector.tsx';
import { CalendarCell } from '#/components/MonthlyView/CalendarCell.tsx';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';
import { RdvDayListModal } from '#/components/MonthlyView/RdvDayListModal.tsx';
import type { MonthCell, RdvWithContact } from '#/models/CalendarModel.ts';

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface MonthlyViewProps {
  cells: MonthCell[];
  isToday: (dayNum: number) => boolean;
  isLoading?: boolean;
  year: number;
  month: number;
}

interface SelectedRdv {
  rdv: RdvWithContact;
  isoDate: string;
}

interface OverflowSelection {
  dayNum: number;
  isoDate: string;
  formattedDate: string;
}

export function MonthlyView({ cells, isToday, isLoading = false, year, month }: MonthlyViewProps) {
  const [selected, setSelected] = useState<SelectedRdv | null>(null);
  const [overflowSel, setOverflowSel] = useState<OverflowSelection | null>(null);

  const buildDate = (dayNum: number) =>
    dayjs().year(year).month(month - 1).date(dayNum);

  const handleRdvClick = (rdv: RdvWithContact, dayNum: number) => {
    setSelected({ rdv, isoDate: buildDate(dayNum).format('YYYY-MM-DD') });
  };

  const handleOverflowClick = (_rdvs: RdvWithContact[], dayNum: number) => {
    const date = buildDate(dayNum);
    setOverflowSel({
      dayNum,
      isoDate: date.format('YYYY-MM-DD'),
      formattedDate: date.format('dddd D MMMM YYYY'),
    });
  };

  // Derive live rdvs from cells so the list stays fresh after cache updates
  const overflowCell = overflowSel
    ? cells.find((c) => c?.dayNum === overflowSel.dayNum)
    : null;
  const overflowRdvs = overflowCell?.rdvs ?? [];

  return (
    <div className="flex flex-col gap-2 px-6">
      <MonthSelector isLoading={isLoading} />

      <div className="border border-[#E7E5E4] rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-[#FFFBF5]">
          {WEEKDAY_HEADERS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wide"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-[#E7E5E4]">
          {cells.map((cell, i) =>
            cell ? (
              <CalendarCell
                key={cell.dayNum}
                dayNum={cell.dayNum}
                rdvs={cell.rdvs}
                isToday={isToday(cell.dayNum)}
                onRdvClick={handleRdvClick}
                onOverflowClick={handleOverflowClick}
              />
            ) : (
              <div key={`pad-${i}`} className="min-h-28 bg-[#FFFBF5]/60" />
            ),
          )}
        </div>
      </div>

      {selected && (
        <RdvDetailModal
          rdv={selected.rdv}
          isoDate={selected.isoDate}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}

      {overflowSel && (
        <RdvDayListModal
          rdvs={overflowRdvs}
          isoDate={overflowSel.isoDate}
          formattedDate={overflowSel.formattedDate}
          open={true}
          onClose={() => setOverflowSel(null)}
        />
      )}
    </div>
  );
}
