import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/fr';
import { getAppointmentsByWeek, getContactById } from '../data/mockData';

dayjs.extend(isoWeek);
dayjs.locale('fr');

export function WeeklyView() {
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf('isoWeek'));
  const [mobileCenter, setMobileCenter] = useState<Dayjs>(dayjs());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const appointments = getAppointmentsByWeek(weekStart);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  
  // For mobile: show 3 days (yesterday, today, tomorrow) centered on mobileCenter
  const mobileDays = [
    mobileCenter.subtract(1, 'day'),
    mobileCenter,
    mobileCenter.add(1, 'day'),
  ];

  const goToPreviousWeek = () => setWeekStart(weekStart.subtract(1, 'week'));
  const goToNextWeek = () => setWeekStart(weekStart.add(1, 'week'));
  const goToThisWeek = () => setWeekStart(dayjs().startOf('isoWeek'));
  
  const goToPreviousMobileDay = () => setMobileCenter(mobileCenter.subtract(1, 'day'));
  const goToNextMobileDay = () => setMobileCenter(mobileCenter.add(1, 'day'));

  const isCurrentWeek = weekStart.isSame(dayjs().startOf('isoWeek'), 'day');
  const today = dayjs();

  const getAppointmentsForDay = (day: Dayjs) => {
    return appointments.filter(apt => apt.date === day.format('YYYY-MM-DD'));
  };

  const getAppointmentPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const top = (startHour * 60 + startMin) / 60;
    const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
    
    return { top, height: duration };
  };

  const displayDays = isMobile ? mobileDays : days;
  const columnWidth = isMobile ? 100 / 3 : 100 / 7;

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] pb-16 md:pb-0">
      {/* Week/Day Navigator */}
      <div className="bg-white border-b border-[#E7E5E4] p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={isMobile ? goToPreviousMobileDay : goToPreviousWeek}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#78716C]" />
          </button>

          <div className="text-center">
            {isMobile ? (
              <>
                <div className="text-lg font-semibold text-[#1C1917] capitalize">
                  {mobileCenter.format('dddd D MMMM')}
                </div>
                <div className="text-sm text-[#78716C]">
                  {mobileCenter.format('YYYY')}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold text-[#1C1917]">
                  {weekStart.format('D MMMM')} - {weekStart.add(6, 'day').format('D MMMM YYYY')}
                </div>
                {!isCurrentWeek && (
                  <button
                    onClick={goToThisWeek}
                    className="text-sm text-[#F59E0B] hover:underline mt-1"
                  >
                    Cette semaine
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={isMobile ? goToNextMobileDay : goToNextWeek}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#78716C]" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className={isMobile ? '' : 'min-w-[800px]'}>
          {/* Day Headers */}
          <div className="sticky top-0 bg-white border-b border-[#E7E5E4] z-10">
            <div className="flex">
              <div className="w-16 flex-shrink-0" /> {/* Time axis space */}
              {displayDays.map(day => {
                const isToday = day.isSame(today, 'day');
                return (
                  <div
                    key={day.format('YYYY-MM-DD')}
                    className={`flex-1 text-center py-3 border-r border-[#E7E5E4] ${
                      isToday ? 'bg-[#FEF3C7]' : ''
                    }`}
                  >
                    <div className="text-xs text-[#78716C] uppercase">
                      {day.format('ddd')}
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        isToday ? 'text-[#F59E0B]' : 'text-[#1C1917]'
                      }`}
                    >
                      {day.format('D')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Grid */}
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="flex border-b border-[#E7E5E4]" style={{ height: '64px' }}>
                {/* Time Label */}
                <div className="w-16 flex-shrink-0 text-xs text-[#78716C] text-right pr-2 pt-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                {/* Day Columns */}
                {displayDays.map((day) => {
                  const isToday = day.isSame(today, 'day');
                  const isEvenHour = hour % 2 === 0;
                  
                  return (
                    <div
                      key={day.format('YYYY-MM-DD')}
                      className={`flex-1 border-r border-[#E7E5E4] relative ${
                        isToday ? 'bg-[#FFFBF5]' : isEvenHour ? 'bg-white' : 'bg-[#FAFAF9]'
                      }`}
                    />
                  );
                })}
              </div>
            ))}

            {/* Appointments */}
            {displayDays.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(day);
              
              return dayAppointments.map(apt => {
                const contact = getContactById(apt.contactId);
                const { top, height } = getAppointmentPosition(apt.startTime, apt.endTime);
                const left = 64 + (dayIndex * columnWidth) + '%';
                const width = columnWidth + '%';

                return (
                  <div
                    key={apt.id}
                    className="absolute rounded-lg p-2 text-white text-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{
                      top: `${top * 64}px`,
                      height: `${height * 64}px`,
                      left,
                      width: `calc(${width} - 2px)`,
                      backgroundColor: '#EA580C',
                      minHeight: '40px',
                    }}
                  >
                    <div className="font-semibold truncate">
                      {contact?.firstName} {contact?.lastName}
                    </div>
                    <div className="text-xs opacity-90">
                      {apt.startTime} - {apt.endTime}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
