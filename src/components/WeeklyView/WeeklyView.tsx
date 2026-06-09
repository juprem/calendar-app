import { useState } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { WeekSelector } from '#/components/WeeklyView/WeekSelector.tsx';
import { WeekTimeGrid } from '#/components/WeeklyView/grid/WeekTimeGrid.tsx';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';
import { AddRdv } from '#/components/Layout/AddRdv/AddRdv.tsx';
import type { DayWithRdv, SelectedRdv } from '#/models/CalendarModel.ts';

interface CreateDefaults {
  isoDate: string;
  startTime: string;
  endTime: string;
}

interface WeeklyViewProps {
  weekDays: (DayWithRdv | null)[];
  monday: Dayjs;
  isLoading?: boolean;
}

function isDateToday(date: Dayjs, today: Dayjs): boolean {
  return (
    date.date() === today.date() &&
    date.month() === today.month() &&
    date.year() === today.year()
  );
}

export function WeeklyView({ weekDays, monday, isLoading = false }: WeeklyViewProps) {
  const today = dayjs();
  const [selected, setSelected] = useState<SelectedRdv | null>(null);
  const [createDefaults, setCreateDefaults] = useState<CreateDefaults | null>(null);
  const checkIsToday = (date: Dayjs) => isDateToday(date, today);

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0">
      <WeekSelector isLoading={isLoading} />

      <div className="flex-1 flex flex-col min-h-0 border border-[#E7E5E4] rounded-xl overflow-hidden">
        <WeekTimeGrid
          weekDays={weekDays}
          monday={monday}
          isDateToday={checkIsToday}
          onRdvClick={(rdv, isoDate) => setSelected({ rdv, isoDate })}
          onCreateRdv={(isoDate, startTime, endTime) => setCreateDefaults({ isoDate, startTime, endTime })}
        />
      </div>

      {selected && (
        <RdvDetailModal
          rdv={selected.rdv}
          isoDate={selected.isoDate}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}

      <AddRdv
        key={JSON.stringify(createDefaults)}
        open={createDefaults !== null}
        onClose={() => setCreateDefaults(null)}
        defaultDay={createDefaults?.isoDate}
        defaultStartTime={createDefaults?.startTime}
        defaultEndTime={createDefaults?.endTime}
      />
    </div>
  );
}
