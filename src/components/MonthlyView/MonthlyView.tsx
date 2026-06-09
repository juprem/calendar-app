import { useState } from 'react';
import dayjs from 'dayjs';
import { MonthSelector } from '#/components/MonthlyView/MonthSelector.tsx';
import { CalendarCell } from '#/components/MonthlyView/CalendarCell.tsx';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';
import type { MonthCell, RdvWithContact, SelectedRdv } from '#/models/CalendarModel.ts';

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface MonthlyViewProps {
  cells: MonthCell[];
  isToday: (dayNum: number) => boolean;
  isLoading?: boolean;
  year: number;
  month: number;
}

export function MonthlyView({ cells, isToday, isLoading = false, year, month }: MonthlyViewProps) {
  const [selected, setSelected] = useState<SelectedRdv | null>(null);

  const buildDate = (dayNum: number) =>
    dayjs().year(year).month(month - 1).date(dayNum);

  const handleRdvClick = (rdv: RdvWithContact, dayNum: number) => {
    setSelected({ rdv, isoDate: buildDate(dayNum).format('YYYY-MM-DD') });
  };

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
                isoDate={buildDate(cell.dayNum).format('YYYY-MM-DD')}
                rdvs={cell.rdvs}
                isToday={isToday(cell.dayNum)}
                onRdvClick={handleRdvClick}
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
    </div>
  );
}
