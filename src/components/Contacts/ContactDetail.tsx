import { Mail, Phone, FileText, Calendar, MapPin, Home } from 'lucide-react';
import { ContactAvatar } from '#/components/Contacts/ContactAvatar.tsx';
import dayjs from 'dayjs';

interface Contact {
  id: number;
  civility: string | null;
  firstname: string;
  lastname: string;
  email: string | null;
  phone_number: string | null;
  notes: string | null;
  birth_date: Date | null;
  birth_location: string | null;
  address: string | null;
}

interface ContactDetailProps {
  contact: Contact;
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const { civility, firstname, lastname, email, phone_number, notes, birth_date, birth_location, address } = contact;

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <div className="flex items-center gap-5 mb-8">
        <ContactAvatar firstname={firstname} lastname={lastname} size="lg" />
        <div>
          {civility && (
            <span className="text-xs font-medium text-[#92400E] uppercase tracking-wide">
              {civility}
            </span>
          )}
          <h2 className="text-2xl font-bold text-[#1C1917]">
            {firstname} {lastname}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {email && (
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{email}</span>
          </div>
        )}
        {phone_number && (
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{phone_number}</span>
          </div>
        )}
        {birth_date && (
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{dayjs(birth_date).format('DD/MM/YYYY')}</span>
          </div>
        )}
        {birth_location && (
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{birth_location}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-3">
            <Home size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{address}</span>
          </div>
        )}
        {notes && (
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-[#92400E] shrink-0 mt-0.5" />
            <p className="text-sm text-[#78716C] leading-relaxed">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
