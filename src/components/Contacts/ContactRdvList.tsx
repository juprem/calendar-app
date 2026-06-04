import { useState } from 'react';
import { DatePicker, Segmented, Spin } from 'antd';
import { CalendarDays } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useGetContactRdv } from '#/services/contactService.ts';
import { RdvCard } from '#/components/DailyView/RdvCard/RdvCard.tsx';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';
import type { RdvWithDay } from '#/models/CalendarModel.ts';
import { ISO_DATE } from '#/utils/dateUtils.ts';

interface ContactRdvListProps {
  contactId: number;
}

type RdvTab = 'upcoming' | 'past';

const TAB_OPTIONS: { label: string; value: RdvTab }[] = [
  { label: 'À venir', value: 'upcoming' },
  { label: 'Passés', value: 'past' },
];

export function ContactRdvList({ contactId }: ContactRdvListProps) {
  const { data: rdvs = [], isLoading } = useGetContactRdv(contactId);
  const [tab, setTab] = useState<RdvTab>('upcoming');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [selectedRdv, setSelectedRdv] = useState<RdvWithDay | null>(null);

  const today = dayjs();

  const nextRdv = rdvs.find((r) => !dayjs(r.day.date).isBefore(today, 'day')) ?? null;

  const filtered = rdvs.filter((r) => {
    const date = dayjs(r.day.date);
    const isUpcoming = !date.isBefore(today, 'day');

    if (tab === 'upcoming' && !isUpcoming) return false;
    if (tab === 'past' && isUpcoming) return false;
    if (dateRange[0] && date.isBefore(dateRange[0], 'day')) return false;
    if (dateRange[1] && date.isAfter(dateRange[1], 'day')) return false;

    return true;
  });

  const sortedFiltered = tab === 'past' ? [...filtered].reverse() : filtered;

  const getIsoDate = (rdv: RdvWithDay) => dayjs(rdv.day.date).format(ISO_DATE);

  return (
    <div className="mt-6 pt-6 border-t border-[#E7E5E4]">
      <h3 className="text-sm font-semibold text-[#1C1917] mb-4">Rendez-vous</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spin size="small" />
        </div>
      ) : (
        <>
          {nextRdv && (
            <div className="mb-5">
              <p className="text-xs text-[#78716C] uppercase tracking-wide font-medium mb-2">
                Prochain
              </p>
              <RdvCard rdv={nextRdv} onClick={() => setSelectedRdv(nextRdv)} />
            </div>
          )}

          {rdvs.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-4 text-[#78716C]">
              <CalendarDays size={28} className="text-[#E7E5E4]" />
              <p className="text-sm">Aucun rendez-vous</p>
            </div>
          )}

          {rdvs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Segmented
                  size="small"
                  options={TAB_OPTIONS}
                  value={tab}
                  onChange={(v) => {
                    setTab(v as RdvTab);
                    setDateRange([null, null]);
                  }}
                />
                <DatePicker.RangePicker
                  size="small"
                  format="DD/MM/YYYY"
                  value={dateRange}
                  onChange={(range) => setDateRange(range ?? [null, null])}
                  allowClear
                />
              </div>

              {sortedFiltered.length === 0 ? (
                <p className="text-sm text-[#78716C] text-center py-3">Aucun résultat</p>
              ) : (
                sortedFiltered.map((rdv) => (
                  <RdvCard key={rdv.id} rdv={rdv} onClick={() => setSelectedRdv(rdv)} />
                ))
              )}
            </div>
          )}
        </>
      )}

      {selectedRdv && (
        <RdvDetailModal
          rdv={selectedRdv}
          isoDate={getIsoDate(selectedRdv)}
          open={true}
          onClose={() => setSelectedRdv(null)}
        />
      )}
    </div>
  );
}
