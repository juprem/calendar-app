import { Input } from 'antd';
import { Search } from 'lucide-react';
import { ContactAvatar } from '#/components/Contacts/ContactAvatar.tsx';

interface Contact {
  id: number;
  civility: string | null;
  firstname: string;
  lastname: string;
  email: string | null;
}

interface ContactListProps {
  contacts: Contact[];
  selectedId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: number) => void;
}

export function ContactList({ contacts, selectedId, search, onSearchChange, onSelect }: ContactListProps) {
  const filtered = contacts.filter(({ firstname, lastname, email }) => {
    const query = search.toLowerCase();
    const matchesName = `${firstname} ${lastname}`.toLowerCase().includes(query);
    const matchesEmail = email?.toLowerCase().includes(query) ?? false;
    return matchesName || matchesEmail;
  });

  return (
    <div className="flex flex-col h-full border-r border-[#E7E5E4]">
      <div className="p-3 border-b border-[#E7E5E4]">
        <Input
          prefix={<Search size={14} className="text-[#78716C]" />}
          placeholder="Rechercher un contact..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="filled"
          size="small"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((contact) => {
          const isSelected = contact.id === selectedId;
          return (
            <button
              key={contact.id}
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
        })}
      </div>
    </div>
  );
}
