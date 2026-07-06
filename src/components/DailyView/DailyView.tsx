import { useState } from 'react';
import { MetricCard } from '#/components/MetricCard/MetricCard.tsx';
import { DayNavigator } from '#/components/DailyView/DayNavigator.tsx';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { RdvCard } from '#/components/DailyView/RdvCard/RdvCard.tsx';
import { getNextRdv } from '#/utils/timeUtils.ts';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';

interface DailyViewProps {
  rdvs: RdvWithContact[];
  isoDate: string;
  isLoading: boolean;
}

export function DailyView({ rdvs, isoDate, isLoading }: DailyViewProps) {
  const [selectedRdv, setSelectedRdv] = useState<RdvWithContact | null>(null);
  const lastAppointment = rdvs[rdvs.length - 1];
  const nextAppointment = rdvs.length === 0 ? null : getNextRdv(rdvs);
  const nextType = nextAppointment?.consultationType ? ` · ${nextAppointment.consultationType}` : '';

  return (
    <div className="p-6">
      <DayNavigator isLoading={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="RDV aujourd'hui" value={rdvs.length} />
        <MetricCard
          label="Prochain RDV"
          value={nextAppointment ? nextAppointment.time : 'Aucun'}
          subtitle={nextAppointment ? `${nextAppointment.patientName}${nextType}` : undefined}
        />
        <MetricCard
          label="Dernier RDV"
          value={lastAppointment ? lastAppointment.startHour : '-'}
          subtitle={lastAppointment ? lastAppointment.name : undefined}
        />
      </div>

      <div>
        {rdvs.map((rdv) => (
          <RdvCard key={rdv.id} rdv={rdv} onClick={() => setSelectedRdv(rdv)} />
        ))}
      </div>

      {selectedRdv && (
        <RdvDetailModal
          rdv={selectedRdv}
          isoDate={isoDate}
          open={true}
          onClose={() => setSelectedRdv(null)}
        />
      )}
    </div>
  );
}
