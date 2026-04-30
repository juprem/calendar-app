import { useState } from 'react';
import { Card, Tag } from 'antd';
import { LeftOutlined, RightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { mockAppointments } from '../mockData';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayAppointments = mockAppointments.filter(
    (apt) => apt.date === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // Calculate metrics
  const appointmentsCount = todayAppointments.length;
  const nextAppointment = todayAppointments.find(
    (apt) => apt.startTime >= format(new Date(), 'HH:mm')
  );
  const lastAppointment = todayAppointments[todayAppointments.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevDay}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <LeftOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>
        
        <div className="text-center">
          <div className="text-2xl" style={{ color: 'var(--app-text-primary)', fontWeight: 600 }}>
            {format(selectedDate, 'EEEE', { locale: fr })}
          </div>
          <div className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
            {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
          </div>
        </div>

        <button
          onClick={handleNextDay}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <RightOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
          <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm mb-1">
            RDV aujourd'hui
          </div>
          <div style={{ color: 'var(--app-primary)' }} className="text-3xl">
            {appointmentsCount}
          </div>
        </Card>

        <Card className="rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
          <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm mb-1">
            Prochain RDV
          </div>
          {nextAppointment ? (
            <>
              <div style={{ color: 'var(--app-primary)' }} className="text-xl">
                {nextAppointment.startTime}
              </div>
              <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                {nextAppointment.patientName}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
              Aucun RDV restant
            </div>
          )}
        </Card>

        <Card className="rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
          <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm mb-1">
            Dernier RDV
          </div>
          {lastAppointment ? (
            <>
              <div style={{ color: 'var(--app-primary)' }} className="text-xl">
                {lastAppointment.endTime}
              </div>
              <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                {lastAppointment.patientName}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
              Aucun RDV
            </div>
          )}
        </Card>
      </div>

      {/* Appointments Timeline */}
      <div className="space-y-3">
        <h3 className="text-lg mb-4" style={{ color: 'var(--app-text-primary)', fontWeight: 600 }}>
          Planning
        </h3>
        {todayAppointments.length === 0 ? (
          <Card className="rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
            <div className="text-center py-8" style={{ color: 'var(--app-text-secondary)' }}>
              Aucun rendez-vous prévu pour cette journée
            </div>
          </Card>
        ) : (
          todayAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: 'var(--app-border)' }}
            >
              <div className="flex gap-4">
                {/* Time Column */}
                <div
                  className="flex flex-col items-end justify-center min-w-[80px] pr-4"
                  style={{ borderRight: '2px solid var(--app-border)' }}
                >
                  <div style={{ color: 'var(--app-primary)' }}>
                    {appointment.startTime}
                  </div>
                  <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                    {appointment.endTime}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div style={{ color: 'var(--app-text-primary)' }} className="mb-1">
                        {appointment.patientName}
                      </div>
                      <Tag
                        style={{
                          backgroundColor: 'var(--app-surface-hover)',
                          color: 'var(--app-secondary-accent)',
                          border: 'none',
                          borderRadius: '6px',
                        }}
                      >
                        {appointment.type}
                      </Tag>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          appointment.status === 'confirmed'
                            ? 'var(--app-success)'
                            : 'var(--app-accent)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
