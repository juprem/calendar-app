import { ContactAvatar } from '#/components/Contacts/ContactDetail/ContactAvatar.tsx';
import type { Contact } from '#/models/ContactModel.ts';

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function ContactListItem({ contact, isSelected, onSelect }: ContactListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#E7E5E4] transition-colors cursor-pointer ${
        isSelected ? 'bg-amber-50' : 'bg-white hover:bg-[#FFFBF5]'
      }`}
    >
      <ContactAvatar firstname={contact.firstname} lastname={contact.lastname} size="sm" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1C1917] truncate">
          {contact.civility && <span className="text-[#92400E] mr-1">{contact.civility}</span>}
          {contact.firstname} {contact.lastname}
        </p>
        {contact.email && (
          <p className="text-xs text-[#78716C] truncate">{contact.email}</p>
        )}
      </div>
    </button>
  );
}
