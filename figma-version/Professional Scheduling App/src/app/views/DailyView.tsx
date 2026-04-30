import { useState } from 'react';
import { Card, Tag } from 'antd';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { getAppointmentsByDate, getContactById } from '../data/mockData';

dayjs.locale('fr');

export function DailyView() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const appointments = getAppointmentsByDate(selectedDate.format('YYYY-MM-DD'));

  const todayAppointments = appointments.filter(apt => apt.status !== 'cancelled');
  const nextAppointment = todayAppointments.find(apt => {
    const aptTime = dayjs(`${apt.date} ${apt.startTime}`);
    return aptTime.isAfter(dayjs());
  });
  const lastAppointment = appointments[appointments.length - 1];

  const isToday = selectedDate.isSame(dayjs(), 'day');

  const goToPreviousDay = () => setSelectedDate(selectedDate.subtract(1, 'day'));
  const goToNextDay = () => setSelectedDate(selectedDate.add(1, 'day'));
  const goToToday = () => setSelectedDate(dayjs());

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return '#EA580C';
      case 'suivi': return '#F59E0B';
      case 'urgence': return '#DC2626';
      case 'bilan': return '#92400E';
      default: return '#78716C';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'suivi': return 'Suivi';
      case 'urgence': return 'Urgence';
      case 'bilan': return 'Bilan';
      default: return type;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
      {/* Date Navigator */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#78716C]" />
          </button>

          <div className="text-center">
            <div className="text-sm text-[#78716C] capitalize">
              {selectedDate.format('dddd')}
            </div>
            <div className="text-xl text-[#1C1917] font-semibold">
              {selectedDate.format('D MMMM YYYY')}
            </div>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-sm text-[#F59E0B] hover:underline mt-1"
              >
                Aujourd'hui
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-[#FEF3C7] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#78716C]" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
          <div className="text-sm text-[#78716C] mb-1">RDV aujourd'hui</div>
          <div className="text-3xl font-semibold text-[#92400E]">
            {todayAppointments.length}
          </div>
        </Card>

        <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
          <div className="text-sm text-[#78716C] mb-1">Prochain RDV</div>
          {nextAppointment ? (
            <>
              <div className="text-lg font-semibold text-[#1C1917]">
                {nextAppointment.startTime}
              </div>
              <div className="text-sm text-[#78716C]">
                {getContactById(nextAppointment.contactId)?.firstName}{' '}
                {getContactById(nextAppointment.contactId)?.lastName}
              </div>
            </>
          ) : (
            <div className="text-lg text-[#78716C]">Aucun</div>
          )}
        </Card>

        <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
          <div className="text-sm text-[#78716C] mb-1">Dernier RDV</div>
          {lastAppointment ? (
            <>
              <div className="text-lg font-semibold text-[#1C1917]">
                {lastAppointment.endTime}
              </div>
              <div className="text-sm text-[#78716C]">
                {getContactById(lastAppointment.contactId)?.firstName}{' '}
                {getContactById(lastAppointment.contactId)?.lastName}
              </div>
            </>
          ) : (
            <div className="text-lg text-[#78716C]">Aucun</div>
          )}
        </Card>
      </div>

      {/* Appointments Timeline */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
            <div className="text-center py-12 text-[#78716C]">
              Aucun rendez-vous pour cette journée
            </div>
          </Card>
        ) : (
          appointments.map(apt => {
            const contact = getContactById(apt.contactId);
            return (
              <Card
                key={apt.id}
                className="rounded-xl border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Time Column */}
                  <div className="flex flex-col items-end min-w-[80px] text-[#78716C]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{apt.startTime}</span>
                    </div>
                    <span className="text-sm">{apt.endTime}</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-[#E7E5E4]" />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[#78716C]" />
                          <span className="font-semibold text-[#1C1917]">
                            {contact?.firstName} {contact?.lastName}
                          </span>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-[#78716C] mt-1">{apt.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Tag
                          color={getTypeColor(apt.type)}
                          className="rounded-full px-3"
                        >
                          {getTypeLabel(apt.type)}
                        </Tag>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            apt.status === 'confirmed'
                              ? 'bg-[#16A34A]'
                              : apt.status === 'pending'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#DC2626]'
                          }`}
                          title={apt.status}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
