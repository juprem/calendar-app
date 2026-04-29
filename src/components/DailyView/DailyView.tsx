import { MetricCard } from '#/components/MetricCard/MetricCard.tsx';
import { Today } from '#/components/DailyView/Today.tsx';

export function DailyView() {
  const nextAppointment = {
    time: '14:00',
    patientName: 'Oliver ABDELNOUR',
    consultationType: 'Consultation',
  };

  const lastAppointment = {
    time: '18:00',
    patientName: 'Oliver ABDELNOUR',
    consultationType: 'Consultation',
  };

  return (
    <>
      <Today />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Prochain RDV"
          value={nextAppointment ? nextAppointment.time : '-'}
          subtitle={
            nextAppointment ? `${nextAppointment.patientName} • ${nextAppointment.consultationType}` : 'No upcoming'
          }
        />
        <MetricCard
          label="Dernier RDV"
          value={lastAppointment ? lastAppointment.time : '-'}
          subtitle={lastAppointment ? lastAppointment.patientName : 'No appointments'}
        />
      </div>
    </>
  );
}
