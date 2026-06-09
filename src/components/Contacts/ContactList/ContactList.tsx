import { Input } from 'antd';
import { Search } from 'lucide-react';
import type { Contact } from '#/models/ContactModel.ts';
import { DataState } from '#/components/DataState/DataState.tsx';
import { ContactListItem } from '#/components/Contacts/ContactList/ContactListItem.tsx';

interface ContactListProps {
  contacts: Contact[];
  selectedId: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ContactList({ contacts, selectedId, search, onSearchChange, onSelect, isLoading = false, isError = false }: ContactListProps) {
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
        <DataState isLoading={isLoading} isError={isError}>
          {filtered.map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </DataState>
      </div>
    </div>
  );
}
