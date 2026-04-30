import { useState } from 'react';
import { Spin } from 'antd';
import { useGetAllContacts } from '#/services/contactService.ts';
import { ContactList } from '#/components/Contacts/ContactList.tsx';
import { ContactDetail } from '#/components/Contacts/ContactDetail.tsx';
import { Users } from 'lucide-react';

export function Contacts() {
  const { data: contacts = [], isLoading } = useGetAllContacts();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-[300px] shrink-0">
        <ContactList
          contacts={contacts}
          selectedId={selectedId}
          search={search}
          onSearchChange={setSearch}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex-1 bg-white">
        {selectedContact ? (
          <ContactDetail contact={selectedContact} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[#78716C]">
            <Users size={40} className="text-[#E7E5E4]" />
            <p className="text-sm">Sélectionnez un contact</p>
          </div>
        )}
      </div>
    </div>
  );
}
