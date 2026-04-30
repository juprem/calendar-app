export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: string;
  status: 'confirmed' | 'pending';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  initials: string;
}
