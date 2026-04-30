import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Drawer } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { getAppointmentsByMonth, getContactById } from '../data/mockData';

dayjs.locale('fr');

export function MonthlyView() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const month = currentDate.month();
  const year = currentDate.year();
  const appointments = getAppointmentsByMonth(month, year);

  const firstDayOfMonth = currentDate.startOf('month');
  const lastDayOfMonth = currentDate.endOf('month');
  const startDate = firstDayOfMonth.startOf('isoWeek');
  const endDate = lastDayOfMonth.endOf('isoWeek');

  const days: Dayjs[] = [];
  let day = startDate;
  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const weeks: Dayjs[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const goToThisMonth = () => setCurrentDate(dayjs());

  const isCurrentMonth = currentDate.isSame(dayjs(), 'month');
  const today = dayjs();

  const getAppointmentsForDay = (day: Dayjs) => {
    return appointments.filter(apt => apt.date === day.format('YYYY-MM-DD'));
  };

  const handleDayClick = (day: Dayjs) => {
    setSelectedDate(day);
    setDrawerOpen(true);
  };

  const selectedDayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
      {/* Month Navigator */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#78716C]" />
          </button>

          <div className="text-center">
            <div className="text-2xl font-semibold text-[#1C1917] capitalize">
              {currentDate.format('MMMM YYYY')}
            </div>
            {!isCurrentMonth && (
              <button
                onClick={goToThisMonth}
                className="text-sm text-[#F59E0B] hover:underline mt-1"
              >
                Ce mois
              </button>
            )}
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#78716C]" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#E7E5E4]">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div
              key={day}
              className="text-center py-3 text-sm font-medium text-[#78716C] uppercase border-r border-[#E7E5E4] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-[#E7E5E4] last:border-b-0">
            {week.map(day => {
              const isToday = day.isSame(today, 'day');
              const isCurrentMonthDay = day.month() === month;
              const dayAppointments = getAppointmentsForDay(day);
              const visibleAppointments = dayAppointments.slice(0, 3);
              const overflowCount = dayAppointments.length - 3;

              return (
                <div
                  key={day.format('YYYY-MM-DD')}
                  className={`min-h-[100px] md:min-h-[120px] p-2 border-r border-[#E7E5E4] last:border-r-0 cursor-pointer hover:bg-[#FFFBF5] transition-colors ${
                    !isCurrentMonthDay ? 'bg-[#FAFAF9]' : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex justify-end mb-2">
                    {isToday ? (
                      <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-semibold text-sm">
                        {day.format('D')}
                      </div>
                    ) : (
                      <div
                        className={`text-sm font-medium ${
                          isCurrentMonthDay ? 'text-[#1C1917]' : 'text-[#A8A29E]'
                        }`}
                      >
                        {day.format('D')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {visibleAppointments.map(apt => {
                      const contact = getContactById(apt.contactId);
                      return (
                        <div
                          key={apt.id}
                          className="text-xs bg-[#EA580C] text-white px-2 py-1 rounded truncate"
                        >
                          {apt.startTime} {contact?.firstName}
                        </div>
                      );
                    })}
                    {overflowCount > 0 && (
                      <div className="text-xs text-[#78716C] px-2">
                        +{overflowCount} autre{overflowCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile Day Drawer */}
      <Drawer
        title={selectedDate?.format('dddd D MMMM YYYY')}
        placement="bottom"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        height="auto"
        styles={{ body: { padding: '16px' } }}
      >
        {selectedDayAppointments.length === 0 ? (
          <div className="text-center py-8 text-[#78716C]">
            Aucun rendez-vous ce jour
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayAppointments.map(apt => {
              const contact = getContactById(apt.contactId);
              return (
                <div
                  key={apt.id}
                  className="bg-white border border-[#E7E5E4] rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1C1917]">
                      {contact?.firstName} {contact?.lastName}
                    </span>
                    <span className="text-sm text-[#78716C]">
                      {apt.startTime} - {apt.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs bg-[#EA580C] text-white px-2 py-1 rounded">
                      {apt.type}
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        apt.status === 'confirmed'
                          ? 'bg-[#16A34A]'
                          : 'bg-[#F59E0B]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
}
