import { useState } from 'react';
import { Input, Avatar, Card, Tag } from 'antd';
import { SearchOutlined, PhoneOutlined, MailOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { mockContacts, mockAppointments } from '../mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ContactsView() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(mockContacts[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedContact = mockContacts.find((c) => c.id === selectedContactId);

  const contactAppointments = selectedContact
    ? mockAppointments
        .filter((apt) => apt.patientId === selectedContact.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="h-[calc(100vh-3rem-4rem)] md:h-[calc(100vh-3rem)]">
      {/* Desktop: Two-column layout */}
      <div className="hidden md:flex h-full">
        {/* Left Sidebar - Contact List */}
        <div
          className="w-80 flex-shrink-0 overflow-y-auto"
          style={{
            borderRight: '1px solid var(--app-border)',
            backgroundColor: 'var(--app-surface)',
          }}
        >
          <div className="p-4">
            <Input
              placeholder="Rechercher un contact..."
              prefix={<SearchOutlined style={{ color: 'var(--app-text-secondary)' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: '8px',
                borderColor: 'var(--app-border)',
              }}
            />
          </div>

          <div className="px-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1"
                style={{
                  backgroundColor:
                    selectedContactId === contact.id
                      ? 'var(--app-surface-hover)'
                      : 'transparent',
                }}
              >
                <Avatar
                  size={40}
                  style={{
                    backgroundColor: 'var(--app-primary)',
                    color: 'white',
                  }}
                >
                  {contact.initials}
                </Avatar>
                <div className="flex-1">
                  <div
                    style={{
                      color:
                        selectedContactId === contact.id
                          ? 'var(--app-primary)'
                          : 'var(--app-text-primary)',
                      fontWeight: selectedContactId === contact.id ? 600 : 400,
                    }}
                  >
                    {contact.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Contact Details */}
        <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: 'var(--app-background)' }}>
          {selectedContact ? (
            <div>
              {/* Contact Header */}
              <div className="flex items-center gap-4 mb-8">
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: 'var(--app-primary)',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  {selectedContact.initials}
                </Avatar>
                <div>
                  <h2 className="text-2xl mb-1" style={{ color: 'var(--app-text-primary)' }}>
                    {selectedContact.name}
                  </h2>
                </div>
              </div>

              {/* Contact Information */}
              <Card className="mb-6 rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <PhoneOutlined
                      style={{ fontSize: '18px', color: 'var(--app-text-secondary)' }}
                    />
                    <div>
                      <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                        Téléphone
                      </div>
                      <div style={{ color: 'var(--app-text-primary)' }}>
                        {selectedContact.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MailOutlined
                      style={{ fontSize: '18px', color: 'var(--app-text-secondary)' }}
                    />
                    <div>
                      <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                        Email
                      </div>
                      <div style={{ color: 'var(--app-text-primary)' }}>
                        {selectedContact.email}
                      </div>
                    </div>
                  </div>

                  {selectedContact.notes && (
                    <div className="flex items-start gap-3">
                      <FileTextOutlined
                        style={{ fontSize: '18px', color: 'var(--app-text-secondary)' }}
                      />
                      <div>
                        <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                          Notes
                        </div>
                        <div style={{ color: 'var(--app-text-primary)' }}>
                          {selectedContact.notes}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Appointments Section */}
              <div>
                <h3
                  className="text-xl mb-4 flex items-center gap-2"
                  style={{ color: 'var(--app-text-primary)' }}
                >
                  <CalendarOutlined />
                  Rendez-vous
                </h3>

                {contactAppointments.length === 0 ? (
                  <Card className="rounded-xl shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
                    <div className="text-center py-6" style={{ color: 'var(--app-text-secondary)' }}>
                      Aucun rendez-vous
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {contactAppointments.map((appointment) => {
                      const isPast = new Date(appointment.date) < new Date();
                      return (
                        <Card
                          key={appointment.id}
                          className="rounded-xl shadow-sm"
                          style={{ borderColor: 'var(--app-border)' }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div style={{ color: 'var(--app-text-primary)' }} className="mb-1">
                                {format(new Date(appointment.date), 'EEEE d MMMM yyyy', {
                                  locale: fr,
                                })}
                              </div>
                              <div
                                style={{ color: 'var(--app-text-secondary)' }}
                                className="text-sm"
                              >
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                              {!isPast && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      appointment.status === 'confirmed'
                                        ? 'var(--app-success)'
                                        : 'var(--app-accent)',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-full"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              Sélectionnez un contact
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Single column list */}
      <div className="md:hidden h-full overflow-y-auto" style={{ backgroundColor: 'var(--app-background)' }}>
        <div className="p-4">
          <Input
            placeholder="Rechercher un contact..."
            prefix={<SearchOutlined style={{ color: 'var(--app-text-secondary)' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
            style={{
              borderRadius: '8px',
              borderColor: 'var(--app-border)',
            }}
          />

          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="rounded-xl shadow-sm cursor-pointer"
                style={{ borderColor: 'var(--app-border)' }}
                onClick={() => setSelectedContactId(contact.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: 'var(--app-primary)',
                      color: 'white',
                    }}
                  >
                    {contact.initials}
                  </Avatar>
                  <div className="flex-1">
                    <div style={{ color: 'var(--app-text-primary)' }} className="mb-1">
                      {contact.name}
                    </div>
                    <div style={{ color: 'var(--app-text-secondary)' }} className="text-sm">
                      {contact.phone}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
