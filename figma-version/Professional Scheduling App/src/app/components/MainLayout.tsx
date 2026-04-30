import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Button, Modal, Form, Input, DatePicker, TimePicker, Select } from 'antd';
import { CalendarOutlined, PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { mockContacts } from '../mockData';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [appointmentForm] = Form.useForm();
  const [contactForm] = Form.useForm();

  const currentPath = location.pathname;
  const activeTab = currentPath === '/' || currentPath === '/daily' ? 'daily' 
    : currentPath === '/weekly' ? 'weekly'
    : currentPath === '/monthly' ? 'monthly'
    : currentPath === '/contacts' ? 'contacts'
    : 'daily';

  const handleTabChange = (tab: string) => {
    navigate(tab === 'daily' ? '/' : `/${tab}`);
  };

  const handleAddAppointment = () => {
    appointmentForm.validateFields().then(() => {
      setAppointmentModalOpen(false);
      appointmentForm.resetFields();
    });
  };

  const handleAddContact = () => {
    contactForm.validateFields().then(() => {
      setContactModalOpen(false);
      contactForm.resetFields();
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--app-background)' }}>
      {/* Desktop Header Navigation */}
      <header className="hidden md:flex sticky top-0 z-50 items-center justify-between px-8 h-12 bg-white shadow-sm" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <div className="flex items-center gap-3">
          <CalendarOutlined style={{ fontSize: '20px', color: 'var(--app-primary)' }} />
          <span className="text-lg" style={{ color: 'var(--app-primary)', fontWeight: 600 }}>Calendrier</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleTabChange('daily')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              color: activeTab === 'daily' ? 'var(--app-primary)' : 'var(--app-text-secondary)',
              backgroundColor: activeTab === 'daily' ? 'var(--app-surface-hover)' : 'transparent',
              fontWeight: activeTab === 'daily' ? 600 : 400,
            }}
          >
            Journalière
          </button>
          <button
            onClick={() => handleTabChange('weekly')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              color: activeTab === 'weekly' ? 'var(--app-primary)' : 'var(--app-text-secondary)',
              backgroundColor: activeTab === 'weekly' ? 'var(--app-surface-hover)' : 'transparent',
              fontWeight: activeTab === 'weekly' ? 600 : 400,
            }}
          >
            Hebdomadaire
          </button>
          <button
            onClick={() => handleTabChange('monthly')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              color: activeTab === 'monthly' ? 'var(--app-primary)' : 'var(--app-text-secondary)',
              backgroundColor: activeTab === 'monthly' ? 'var(--app-surface-hover)' : 'transparent',
              fontWeight: activeTab === 'monthly' ? 600 : 400,
            }}
          >
            Mensuelle
          </button>
          <button
            onClick={() => handleTabChange('contacts')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              color: activeTab === 'contacts' ? 'var(--app-primary)' : 'var(--app-text-secondary)',
              backgroundColor: activeTab === 'contacts' ? 'var(--app-surface-hover)' : 'transparent',
              fontWeight: activeTab === 'contacts' ? 600 : 400,
            }}
          >
            Contacts
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAppointmentModalOpen(true)}
            style={{
              backgroundColor: 'var(--app-primary)',
              borderColor: 'var(--app-primary)',
              borderRadius: '8px',
            }}
          >
            RDV
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setContactModalOpen(true)}
            style={{
              color: 'var(--app-primary)',
              borderColor: 'var(--app-primary)',
              borderRadius: '8px',
            }}
          >
            Contact
          </Button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg" style={{ borderTop: '1px solid var(--app-border)' }}>
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => handleTabChange('daily')}
            className="flex flex-col items-center justify-center flex-1 h-full"
            style={{
              color: activeTab === 'daily' ? 'var(--app-accent)' : 'var(--app-text-secondary)',
            }}
          >
            <CalendarOutlined style={{ fontSize: '20px' }} />
            <span className="text-xs mt-1">Journalière</span>
          </button>
          <button
            onClick={() => handleTabChange('weekly')}
            className="flex flex-col items-center justify-center flex-1 h-full"
            style={{
              color: activeTab === 'weekly' ? 'var(--app-accent)' : 'var(--app-text-secondary)',
            }}
          >
            <CalendarOutlined style={{ fontSize: '20px' }} />
            <span className="text-xs mt-1">Hebdo</span>
          </button>
          <button
            onClick={() => handleTabChange('monthly')}
            className="flex flex-col items-center justify-center flex-1 h-full"
            style={{
              color: activeTab === 'monthly' ? 'var(--app-accent)' : 'var(--app-text-secondary)',
            }}
          >
            <CalendarOutlined style={{ fontSize: '20px' }} />
            <span className="text-xs mt-1">Mensuelle</span>
          </button>
          <button
            onClick={() => handleTabChange('contacts')}
            className="flex flex-col items-center justify-center flex-1 h-full"
            style={{
              color: activeTab === 'contacts' ? 'var(--app-accent)' : 'var(--app-text-secondary)',
            }}
          >
            <UserOutlined style={{ fontSize: '20px' }} />
            <span className="text-xs mt-1">Contacts</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setAppointmentModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{
          backgroundColor: 'var(--app-primary)',
          color: 'white',
        }}
      >
        <PlusOutlined style={{ fontSize: '24px' }} />
      </button>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Add Appointment Modal */}
      <Modal
        title="Nouveau Rendez-vous"
        open={appointmentModalOpen}
        onOk={handleAddAppointment}
        onCancel={() => setAppointmentModalOpen(false)}
        okText="Créer"
        cancelText="Annuler"
        okButtonProps={{
          style: {
            backgroundColor: 'var(--app-primary)',
            borderColor: 'var(--app-primary)',
          },
        }}
      >
        <Form form={appointmentForm} layout="vertical" className="mt-4">
          <Form.Item
            name="patient"
            label="Patient"
            rules={[{ required: true, message: 'Veuillez sélectionner un patient' }]}
          >
            <Select placeholder="Sélectionner un patient">
              {mockContacts.map((contact) => (
                <Select.Option key={contact.id} value={contact.id}>
                  {contact.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              name="startTime"
              label="Heure de début"
              rules={[{ required: true, message: 'Requis' }]}
              className="flex-1"
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item
              name="endTime"
              label="Heure de fin"
              rules={[{ required: true, message: 'Requis' }]}
              className="flex-1"
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </div>
          <Form.Item
            name="type"
            label="Type de rendez-vous"
            rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
          >
            <Select placeholder="Type de RDV">
              <Select.Option value="consultation">Consultation</Select.Option>
              <Select.Option value="suivi">Suivi</Select.Option>
              <Select.Option value="premiere">Première visite</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Contact Modal */}
      <Modal
        title="Nouveau Contact"
        open={contactModalOpen}
        onOk={handleAddContact}
        onCancel={() => setContactModalOpen(false)}
        okText="Créer"
        cancelText="Annuler"
        okButtonProps={{
          style: {
            backgroundColor: 'var(--app-primary)',
            borderColor: 'var(--app-primary)',
          },
        }}
      >
        <Form form={contactForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nom complet"
            rules={[{ required: true, message: 'Veuillez saisir le nom' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nom et prénom" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Téléphone"
            rules={[{ required: true, message: 'Veuillez saisir le numéro' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+33 6 12 34 56 78" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Veuillez saisir un email valide' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@exemple.com" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Notes additionnelles..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}