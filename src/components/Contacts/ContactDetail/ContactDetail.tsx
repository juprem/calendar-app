import { Mail, Phone, FileText, Calendar, MapPin, Home, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { Button, Popconfirm } from 'antd';
import { ContactAvatar } from '#/components/Contacts/ContactDetail/ContactAvatar.tsx';
import dayjs from 'dayjs';
import type { Contact } from '#/models/ContactModel.ts';
import { useDeleteContact } from '#/services/contactService.ts';
import { ContactRdvList } from '#/components/Contacts/ContactDetail/ContactRdvList.tsx';
import { useGetAllGeneralPractitioners } from '#/services/generalPractitionerService.ts';
import { formatGeneralPractitionerName } from '#/models/GeneralPractitionerModel.ts';

function formatPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');

  if (phoneNumber.startsWith('+33') && digits.length === 11) {
    return `+33 ${digits[2]} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }

  return phoneNumber;
}

interface ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContactDetail({ contact, onEdit, onDelete }: ContactDetailProps) {
  const { civility, firstname, lastname, email, phone_number, notes, birth_date, birth_location, address } = contact;
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();
  const { data: generalPractitioners = [] } = useGetAllGeneralPractitioners();
  const generalPractitioner = generalPractitioners.find((gp) => gp.id === contact.general_practitioner_id) ?? null;

  const handleDelete = () => {
    deleteContact(contact.id, { onSuccess: onDelete });
  };

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <div className="flex items-start justify-between gap-5 mb-8">
        <div className="flex items-center gap-5">
          <ContactAvatar firstname={firstname} lastname={lastname} size="md" />
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
        <div className="flex items-center gap-2">
          <Popconfirm
            title="Supprimer ce contact ?"
            description="Cette action est irréversible."
            onConfirm={handleDelete}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Button
              shape="round"
              size="small"
              danger
              icon={<Trash2 size={13} />}
              loading={isDeleting}
            />
          </Popconfirm>
          <Button shape="round" size="small" icon={<Pencil size={13} />} onClick={onEdit}>
            Modifier
          </Button>
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
            <span className="text-sm text-[#1C1917]">{formatPhoneNumber(phone_number)}</span>
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
        {generalPractitioner && (
          <div className="flex items-center gap-3">
            <Stethoscope size={16} className="text-[#92400E] shrink-0" />
            <span className="text-sm text-[#1C1917]">{formatGeneralPractitionerName(generalPractitioner)}</span>
          </div>
        )}
        {notes && (
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-[#92400E] shrink-0 mt-0.5" />
            <p className="text-sm text-[#78716C] leading-relaxed">{notes}</p>
          </div>
        )}
      </div>

      <ContactRdvList contactId={contact.id} />
    </div>
  );
}
