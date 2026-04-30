import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { AppointmentModal } from '../components/AppointmentModal';
import { ContactModal } from '../components/ContactModal';

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {!isMobile && (
        <Header
          onNewAppointment={() => setAppointmentModalOpen(true)}
          onNewContact={() => setContactModalOpen(true)}
        />
      )}

      <main className={isMobile ? '' : ''}>
        <Outlet />
      </main>

      {isMobile && (
        <MobileNav onNewAppointment={() => setAppointmentModalOpen(true)} />
      )}

      <AppointmentModal
        open={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
      />

      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}
