import dayjs, { Dayjs } from 'dayjs';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  contactId: string;
  title: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  type: 'consultation' | 'suivi' | 'urgence' | 'bilan';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export const contacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie.dubois@email.fr',
    phone: '+33 6 12 34 56 78',
    notes: 'Patiente régulière, préfère les rendez-vous le matin'
  },
  {
    id: '2',
    firstName: 'Marc',
    lastName: 'Laurent',
    email: 'marc.laurent@email.fr',
    phone: '+33 6 23 45 67 89',
    notes: 'Allergies: pénicilline'
  },
  {
    id: '3',
    firstName: 'Claire',
    lastName: 'Martin',
    email: 'claire.martin@email.fr',
    phone: '+33 6 34 56 78 90',
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@email.fr',
    phone: '+33 6 45 67 89 01',
    notes: 'Traitement en cours'
  },
  {
    id: '5',
    firstName: 'Isabelle',
    lastName: 'Petit',
    email: 'isabelle.petit@email.fr',
    phone: '+33 6 56 78 90 12',
  },
  {
    id: '6',
    firstName: 'Jean',
    lastName: 'Moreau',
    email: 'jean.moreau@email.fr',
    phone: '+33 6 67 89 01 23',
  },
  {
    id: '7',
    firstName: 'Marie',
    lastName: 'Simon',
    email: 'marie.simon@email.fr',
    phone: '+33 6 78 90 12 34',
  },
  {
    id: '8',
    firstName: 'Pierre',
    lastName: 'Michel',
    email: 'pierre.michel@email.fr',
    phone: '+33 6 89 01 23 45',
  },
];

// Generate appointments for the current week and month
const today = dayjs();
const getDateString = (date: Dayjs) => date.format('YYYY-MM-DD');

export const appointments: Appointment[] = [
  // Today's appointments
  {
    id: 'apt1',
    contactId: '1',
    title: 'Consultation',
    date: getDateString(today),
    startTime: '09:00',
    endTime: '09:45',
    type: 'consultation',
    status: 'confirmed',
    notes: 'Premier rendez-vous de la journée'
  },
  {
    id: 'apt2',
    contactId: '2',
    title: 'Suivi',
    date: getDateString(today),
    startTime: '10:00',
    endTime: '10:30',
    type: 'suivi',
    status: 'confirmed',
  },
  {
    id: 'apt3',
    contactId: '3',
    title: 'Consultation',
    date: getDateString(today),
    startTime: '14:00',
    endTime: '14:45',
    type: 'consultation',
    status: 'pending',
  },
  {
    id: 'apt4',
    contactId: '4',
    title: 'Bilan',
    date: getDateString(today),
    startTime: '16:00',
    endTime: '17:00',
    type: 'bilan',
    status: 'confirmed',
  },
  
  // Tomorrow
  {
    id: 'apt5',
    contactId: '5',
    title: 'Consultation',
    date: getDateString(today.add(1, 'day')),
    startTime: '09:30',
    endTime: '10:15',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 'apt6',
    contactId: '6',
    title: 'Suivi',
    date: getDateString(today.add(1, 'day')),
    startTime: '11:00',
    endTime: '11:30',
    type: 'suivi',
    status: 'confirmed',
  },
  {
    id: 'apt7',
    contactId: '7',
    title: 'Urgence',
    date: getDateString(today.add(1, 'day')),
    startTime: '15:00',
    endTime: '15:30',
    type: 'urgence',
    status: 'pending',
  },
  
  // Day after tomorrow
  {
    id: 'apt8',
    contactId: '8',
    title: 'Consultation',
    date: getDateString(today.add(2, 'day')),
    startTime: '10:00',
    endTime: '10:45',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 'apt9',
    contactId: '1',
    title: 'Suivi',
    date: getDateString(today.add(2, 'day')),
    startTime: '14:30',
    endTime: '15:00',
    type: 'suivi',
    status: 'confirmed',
  },
  
  // Next week
  {
    id: 'apt10',
    contactId: '2',
    title: 'Consultation',
    date: getDateString(today.add(7, 'day')),
    startTime: '09:00',
    endTime: '09:45',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 'apt11',
    contactId: '3',
    title: 'Bilan',
    date: getDateString(today.add(7, 'day')),
    startTime: '13:00',
    endTime: '14:00',
    type: 'bilan',
    status: 'pending',
  },
  {
    id: 'apt12',
    contactId: '4',
    title: 'Suivi',
    date: getDateString(today.add(8, 'day')),
    startTime: '10:30',
    endTime: '11:00',
    type: 'suivi',
    status: 'confirmed',
  },
  {
    id: 'apt13',
    contactId: '5',
    title: 'Consultation',
    date: getDateString(today.add(9, 'day')),
    startTime: '15:00',
    endTime: '15:45',
    type: 'consultation',
    status: 'confirmed',
  },
  
  // Previous week (for history)
  {
    id: 'apt14',
    contactId: '1',
    title: 'Consultation',
    date: getDateString(today.subtract(2, 'day')),
    startTime: '09:00',
    endTime: '09:45',
    type: 'consultation',
    status: 'confirmed',
  },
  {
    id: 'apt15',
    contactId: '6',
    title: 'Suivi',
    date: getDateString(today.subtract(5, 'day')),
    startTime: '14:00',
    endTime: '14:30',
    type: 'suivi',
    status: 'confirmed',
  },
];

export const getContactById = (id: string): Contact | undefined => {
  return contacts.find(c => c.id === id);
};

export const getAppointmentsByDate = (date: string): Appointment[] => {
  return appointments.filter(apt => apt.date === date).sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
};

export const getAppointmentsByContact = (contactId: string): Appointment[] => {
  return appointments.filter(apt => apt.contactId === contactId).sort((a, b) => 
    b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)
  );
};

export const getAppointmentsByWeek = (startDate: Dayjs): Appointment[] => {
  const endDate = startDate.add(6, 'day');
  return appointments.filter(apt => {
    const aptDate = dayjs(apt.date);
    return aptDate.isSame(startDate, 'day') || 
           (aptDate.isAfter(startDate) && aptDate.isBefore(endDate)) ||
           aptDate.isSame(endDate, 'day');
  });
};

export const getAppointmentsByMonth = (month: number, year: number): Appointment[] => {
  return appointments.filter(apt => {
    const aptDate = dayjs(apt.date);
    return aptDate.month() === month && aptDate.year() === year;
  });
};
