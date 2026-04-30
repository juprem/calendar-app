import { useState } from 'react';
import { Input, Avatar, Card } from 'antd';
import { Search, Mail, Phone, FileText, Calendar } from 'lucide-react';
import { contacts, getAppointmentsByContact } from '../data/mockData';
import dayjs from 'dayjs';

export function ContactsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contacts[0]?.id || null);

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const contactAppointments = selectedContactId ? getAppointmentsByContact(selectedContactId) : [];
  const upcomingAppointments = contactAppointments.filter(apt => 
    dayjs(apt.date).isAfter(dayjs()) || dayjs(apt.date).isSame(dayjs(), 'day')
  );
  const pastAppointments = contactAppointments.filter(apt => 
    dayjs(apt.date).isBefore(dayjs(), 'day')
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] pb-16 md:pb-0">
      {/* Contact List Sidebar - Hidden on mobile unless no contact selected */}
      <div className={`w-full md:w-80 border-r border-[#E7E5E4] bg-white flex flex-col ${
        selectedContactId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search */}
        <div className="p-4 border-b border-[#E7E5E4]">
          <Input
            prefix={<Search className="w-4 h-4 text-[#78716C]" />}
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="rounded-lg"
          />
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-[#FEF3C7] transition-colors border-b border-[#E7E5E4] ${
                selectedContactId === contact.id ? 'bg-[#FEF3C7]' : ''
              }`}
            >
              <Avatar
                size={40}
                style={{
                  backgroundColor: '#92400E',
                  color: 'white',
                }}
              >
                {getInitials(contact.firstName, contact.lastName)}
              </Avatar>
              <div className="text-left flex-1">
                <div className="font-semibold text-[#1C1917]">
                  {contact.firstName} {contact.lastName}
                </div>
                <div className="text-sm text-[#78716C]">{contact.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Detail Panel */}
      {selectedContact ? (
        <div className={`flex-1 overflow-y-auto bg-[#FFFBF5] p-4 md:p-6 ${
          selectedContactId ? 'block' : 'hidden md:block'
        }`}>
          {/* Back button for mobile */}
          <button
            onClick={() => setSelectedContactId(null)}
            className="md:hidden mb-4 text-[#92400E] hover:underline"
          >
            ← Retour à la liste
          </button>

          {/* Contact Header */}
          <Card className="rounded-xl border-[#E7E5E4] shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                size={64}
                style={{
                  backgroundColor: '#92400E',
                  color: 'white',
                  fontSize: '24px',
                }}
              >
                {getInitials(selectedContact.firstName, selectedContact.lastName)}
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-[#1C1917]">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h2>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#1C1917]">
                <Mail className="w-5 h-5 text-[#78716C]" />
                <a href={`mailto:${selectedContact.email}`} className="hover:underline">
                  {selectedContact.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-[#1C1917]">
                <Phone className="w-5 h-5 text-[#78716C]" />
                <a href={`tel:${selectedContact.phone}`} className="hover:underline">
                  {selectedContact.phone}
                </a>
              </div>
              {selectedContact.notes && (
                <div className="flex gap-3 text-[#1C1917]">
                  <FileText className="w-5 h-5 text-[#78716C] flex-shrink-0 mt-0.5" />
                  <p className="text-[#78716C]">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card className="rounded-xl border-[#E7E5E4] shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#92400E]" />
                Rendez-vous à venir
              </h3>
              <div className="space-y-3">
                {upcomingAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-[#FFFBF5] rounded-lg border border-[#E7E5E4]"
                  >
                    <div>
                      <div className="font-medium text-[#1C1917]">
                        {dayjs(apt.date).format('dddd D MMMM YYYY')}
                      </div>
                      <div className="text-sm text-[#78716C]">
                        {apt.startTime} - {apt.endTime}
                      </div>
                    </div>
                    <div className="text-sm text-[#EA580C] font-medium">
                      {apt.type}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#78716C]" />
                Historique
              </h3>
              <div className="space-y-3">
                {pastAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4]"
                  >
                    <div>
                      <div className="font-medium text-[#78716C]">
                        {dayjs(apt.date).format('dddd D MMMM YYYY')}
                      </div>
                      <div className="text-sm text-[#A8A29E]">
                        {apt.startTime} - {apt.endTime}
                      </div>
                    </div>
                    <div className="text-sm text-[#78716C]">
                      {apt.type}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {contactAppointments.length === 0 && (
            <Card className="rounded-xl border-[#E7E5E4] shadow-sm">
              <div className="text-center py-8 text-[#78716C]">
                Aucun rendez-vous pour ce contact
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-[#FFFBF5]">
          <div className="text-center text-[#78716C]">
            Sélectionnez un contact pour voir les détails
          </div>
        </div>
      )}
    </div>
  );
}
