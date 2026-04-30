import { Spin } from 'antd';
import { MonthSelector } from '#/components/MonthlyView/MonthSelector.tsx';
import { CalendarCell } from '#/components/MonthlyView/CalendarCell.tsx';
import type { day as DayRecord, rdv } from '../../../generated/prisma/client.ts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

type DayWithRdv = DayRecord & { rdv: rdv[] };

interface MonthlyViewProps {
  days: DayWithRdv[];
  currentDay: Dayjs;
  isLoading?: boolean;
}

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export function MonthlyView({ days, currentDay, isLoading = false }: MonthlyViewProps) {
  const today = dayjs();
  const firstOfMonth = currentDay.startOf('month');
  const daysInMonth = currentDay.daysInMonth();

  const firstWeekday = firstOfMonth.day();
  const leadingPad = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const totalCells = Math.ceil((leadingPad + daysInMonth) / 7) * 7;

  const rdvByDay = new Map<number, rdv[]>();
  for (const d of days) {
    rdvByDay.set(d.date.getUTCDate(), d.rdv);
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - leadingPad + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return { dayNum, rdvs: rdvByDay.get(dayNum) ?? [] };
  });

  const isToday = (dayNum: number) =>
    today.date() === dayNum &&
    today.month() === currentDay.month() &&
    today.year() === currentDay.year();

  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <MonthSelector />
        </div>
        {isLoading && <Spin size="small" />}
      </div>

      <div className="border border-[#E7E5E4] rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-[#FFFBF5] border-b border-[#E7E5E4]">
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
              />
            ) : (
              <div key={`pad-${i}`} className="min-h-28 bg-[#FFFBF5]/60" />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
