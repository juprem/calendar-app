import { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Drawer, Card, Tag } from 'antd';
import { mockAppointments } from '../mockData';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export function MonthlyView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setDrawerOpen(true);
  };

  const getAppointmentsForDay = (day: Date) => {
    const dayDate = format(day, 'yyyy-MM-dd');
    return mockAppointments.filter((apt) => apt.date === dayDate);
  };

  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const selectedDayAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <LeftOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>

        <div className="text-2xl" style={{ color: 'var(--app-text-primary)', fontWeight: 600 }}>
          {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
        </div>

        <button
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <RightOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--app-border)' }}>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center py-3 text-sm"
              style={{
                color: 'var(--app-text-secondary)',
                borderBottom: '1px solid var(--app-border)',
                fontWeight: 600,
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const appointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, selectedMonth);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className="min-h-[100px] md:min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{
                  borderRight: '1px solid var(--app-border)',
                  borderBottom: '1px solid var(--app-border)',
                  opacity: isCurrentMonth ? 1 : 0.4,
                }}
              >
                <div className="flex items-center justify-end mb-2">
                  <div
                    className={`text-sm ${today ? 'w-7 h-7 rounded-full flex items-center justify-center' : ''}`}
                    style={{
                      color: today ? 'white' : isCurrentMonth ? 'var(--app-text-primary)' : 'var(--app-text-secondary)',
                      backgroundColor: today ? 'var(--app-accent)' : 'transparent',
                      fontWeight: today ? 600 : 400,
                    }}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-xs px-2 py-1 rounded truncate"
                      style={{
                        backgroundColor: 'var(--app-surface-hover)',
                        color: 'var(--app-secondary-accent)',
                      }}
                    >
                      {appointment.startTime} {appointment.patientName}
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <div
                      className="text-xs px-2 py-1"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      +{appointments.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Drawer (Mobile) */}
      <Drawer
        title={selectedDay ? format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
        placement="bottom"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        height="70vh"
        className="md:hidden"
      >
        {selectedDayAppointments.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--app-text-secondary)' }}>
            Aucun rendez-vous
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="shadow-sm"
                style={{ borderColor: 'var(--app-border)', borderRadius: '8px' }}
              >
                <div className="flex gap-4">
                  <div
                    className="flex flex-col items-end justify-center min-w-[70px] pr-3"
                    style={{ borderRight: '2px solid var(--app-border)' }}
                  >
                    <div style={{ color: 'var(--app-primary)' }}>
                      {appointment.startTime}
                    </div>
                    <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                      {appointment.endTime}
                    </div>
                  </div>
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
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}
