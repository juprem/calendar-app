import { Appointment, Contact } from './types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    phone: '+33 6 12 34 56 78',
    email: 'sophie.martin@email.com',
    notes: 'Préfère les rendez-vous matinaux',
    initials: 'SM',
  },
  {
    id: '2',
    name: 'Jean Dupont',
    phone: '+33 6 23 45 67 89',
    email: 'jean.dupont@email.com',
    notes: 'Allergique aux arachides',
    initials: 'JD',
  },
  {
    id: '3',
    name: 'Marie Laurent',
    phone: '+33 6 34 56 78 90',
    email: 'marie.laurent@email.com',
    notes: 'Suivi régulier tous les mois',
    initials: 'ML',
  },
  {
    id: '4',
    name: 'Pierre Bernard',
    phone: '+33 6 45 67 89 01',
    email: 'pierre.bernard@email.com',
    notes: 'Nouveau patient',
    initials: 'PB',
  },
  {
    id: '5',
    name: 'Claire Dubois',
    phone: '+33 6 56 78 90 12',
    email: 'claire.dubois@email.com',
    notes: 'Préfère communication par email',
    initials: 'CD',
  },
];

// Helper function to get date string for relative days
const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const mockAppointments: Appointment[] = [
  // Today's appointments
  {
    id: '1',
    patientName: 'Sophie Martin',
    patientId: '1',
    date: getDateString(0),
    startTime: '09:00',
    endTime: '10:00',
    type: 'Consultation',
    status: 'confirmed',
  },
  {
    id: '2',
    patientName: 'Jean Dupont',
    patientId: '2',
    date: getDateString(0),
    startTime: '10:30',
    endTime: '11:30',
    type: 'Suivi',
    status: 'confirmed',
  },
  {
    id: '3',
    patientName: 'Marie Laurent',
    patientId: '3',
    date: getDateString(0),
    startTime: '14:00',
    endTime: '15:00',
    type: 'Consultation',
    status: 'pending',
  },
  {
    id: '4',
    patientName: 'Pierre Bernard',
    patientId: '4',
    date: getDateString(0),
    startTime: '16:00',
    endTime: '17:00',
    type: 'Première visite',
    status: 'confirmed',
  },
  // Tomorrow's appointments
  {
    id: '5',
    patientName: 'Claire Dubois',
    patientId: '5',
    date: getDateString(1),
    startTime: '09:00',
    endTime: '10:00',
    type: 'Consultation',
    status: 'confirmed',
  },
  {
    id: '6',
    patientName: 'Sophie Martin',
    patientId: '1',
    date: getDateString(1),
    startTime: '11:00',
    endTime: '12:00',
    type: 'Suivi',
    status: 'confirmed',
  },
  // Next week's appointments
  {
    id: '7',
    patientName: 'Jean Dupont',
    patientId: '2',
    date: getDateString(7),
    startTime: '10:00',
    endTime: '11:00',
    type: 'Consultation',
    status: 'pending',
  },
  {
    id: '8',
    patientName: 'Marie Laurent',
    patientId: '3',
    date: getDateString(8),
    startTime: '15:00',
    endTime: '16:00',
    type: 'Suivi',
    status: 'confirmed',
  },
  // Yesterday's appointment
  {
    id: '9',
    patientName: 'Pierre Bernard',
    patientId: '4',
    date: getDateString(-1),
    startTime: '14:00',
    endTime: '15:00',
    type: 'Consultation',
    status: 'confirmed',
  },
  // This week - various days
  {
    id: '10',
    patientName: 'Claire Dubois',
    patientId: '5',
    date: getDateString(2),
    startTime: '13:00',
    endTime: '14:00',
    type: 'Consultation',
    status: 'confirmed',
  },
  {
    id: '11',
    patientName: 'Sophie Martin',
    patientId: '1',
    date: getDateString(3),
    startTime: '10:00',
    endTime: '11:00',
    type: 'Suivi',
    status: 'pending',
  },
  {
    id: '12',
    patientName: 'Jean Dupont',
    patientId: '2',
    date: getDateString(4),
    startTime: '09:30',
    endTime: '10:30',
    type: 'Consultation',
    status: 'confirmed',
  },
];
