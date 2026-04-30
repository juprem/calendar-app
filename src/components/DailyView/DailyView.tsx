import { MetricCard } from '#/components/MetricCard/MetricCard.tsx';
import { DayNavigator } from '#/components/DailyView/DayNavigator.tsx';
import type { rdv } from '../../../generated/prisma/client.ts';
import { RdvCard } from '#/components/DailyView/RdvCard/RdvCard.tsx';
import { getNextRdv } from '#/components/DailyView/utils/getNextRdv.ts';

interface DailyViewProps {
  rdvs: rdv[];
}

export function DailyView({ rdvs }: DailyViewProps) {
  const lastAppointment = rdvs[rdvs.length - 1];
  const nextAppointment = rdvs.length === 0 ? null : getNextRdv(rdvs);
  const nextType = nextAppointment?.consultationType ? ` · ${nextAppointment.consultationType}` : '';

  return (
    <div className="p-6">
      <DayNavigator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="RDV aujourd'hui" value={rdvs.length} />
        <MetricCard
          label="Prochain RDV"
          value={nextAppointment ? nextAppointment.time : 'Aucun'}
          subtitle={nextAppointment ? `${nextAppointment.patientName}${nextType}` : undefined}
        />
        <MetricCard
          label="Dernier RDV"
          value={lastAppointment ? lastAppointment.start_hour : '-'}
          subtitle={lastAppointment ? lastAppointment.name : undefined}
        />
      </div>
      <div>
        {rdvs.map(({ id, start_hour, end_hour, name, rdv_type, is_confirmed }) => (
          <RdvCard
            key={id}
            name={name}
            start_hour={start_hour}
            end_hour={end_hour}
            type={rdv_type}
            is_confirmed={is_confirmed}
          />
        ))}
      </div>
    </div>
  );
}
