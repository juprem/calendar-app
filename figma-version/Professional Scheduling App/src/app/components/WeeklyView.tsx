import { useState, useRef, useEffect } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { mockAppointments } from '../mockData';
import { format, startOfWeek, addDays, addWeeks, subWeeks, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export function WeeklyView() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrevWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

  // Generate the days to show (7 for desktop, 3 for mobile centered on today)
  const weekDays = isMobile 
    ? [subDays(new Date(), 1), new Date(), addDays(new Date(), 1)]
    : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter appointments for this week
  const weekAppointments = mockAppointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return aptDate >= weekStart && aptDate < addDays(weekStart, 7);
  });

  // Time slots (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate position for appointment blocks
  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    return {
      top: (startMinutes / 60) * 64, // 64px per hour
      height: (duration / 60) * 64,
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <div className="h-[calc(100vh-3rem)] md:h-[calc(100vh-3rem)] flex flex-col" style={{ backgroundColor: 'var(--app-background)' }}>
      {/* Week Navigator */}
      <div className="flex items-center justify-between px-4 py-4 md:px-8 bg-white" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <button
          onClick={handlePrevWeek}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <LeftOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>
        
        <div className="text-center">
          <div className="text-xl md:text-2xl" style={{ color: 'var(--app-text-primary)', fontWeight: 600 }}>
            {format(weekStart, 'd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{ border: '1px solid var(--app-border)' }}
        >
          <RightOutlined style={{ color: 'var(--app-text-secondary)' }} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div className="min-w-max">
          {/* Column Headers */}
          <div className="flex sticky top-0 z-10 bg-white" style={{ borderBottom: '1px solid var(--app-border)' }}>
            <div className="w-16 flex-shrink-0" /> {/* Time axis spacer */}
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[120px] md:min-w-[140px] text-center py-3"
                style={{
                  backgroundColor: isToday(day) ? 'var(--app-surface-hover)' : 'white',
                  borderRight: '1px solid var(--app-border)',
                }}
              >
                <div
                  style={{
                    color: isToday(day) ? 'var(--app-accent)' : 'var(--app-text-secondary)',
                    fontSize: '12px',
                  }}
                >
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div
                  className={`text-lg inline-flex items-center justify-center ${
                    isToday(day) ? 'w-8 h-8 rounded-full' : ''
                  }`}
                  style={{
                    color: isToday(day) ? 'white' : 'var(--app-text-primary)',
                    backgroundColor: isToday(day) ? 'var(--app-accent)' : 'transparent',
                    fontWeight: isToday(day) ? 600 : 400,
                  }}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="flex relative">
            {/* Time Axis */}
            <div className="w-16 flex-shrink-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 flex items-start justify-end pr-2 text-xs"
                  style={{
                    color: 'var(--app-text-secondary)',
                    borderBottom: '1px solid var(--app-border)',
                  }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => {
              const dayDate = format(day, 'yyyy-MM-dd');
              const dayAppointments = weekAppointments.filter((apt) => apt.date === dayDate);

              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 min-w-[120px] md:min-w-[140px] relative"
                  style={{
                    backgroundColor: isToday(day) ? 'rgba(245, 158, 11, 0.05)' : 'white',
                    borderRight: '1px solid var(--app-border)',
                  }}
                >
                  {/* Hour Lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16"
                      style={{
                        borderBottom: '1px solid var(--app-border)',
                        backgroundColor: hour % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.01)',
                      }}
                    />
                  ))}

                  {/* Appointment Blocks */}
                  {dayAppointments.map((appointment) => {
                    const position = getAppointmentPosition(appointment.startTime, appointment.endTime);
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer"
                        style={{
                          top: position.top,
                          height: position.height,
                          backgroundColor: 'var(--app-primary)',
                          color: 'white',
                          padding: '4px 8px',
                          zIndex: 1,
                        }}
                      >
                        <div className="text-xs opacity-90">{appointment.startTime}</div>
                        <div className="text-sm truncate">{appointment.patientName}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}