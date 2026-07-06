import { useState } from 'react';
import { useGetAllContacts } from '#/services/contactService.ts';
import { ContactList } from '#/components/Contacts/ContactList/ContactList.tsx';
import { ContactDetail } from '#/components/Contacts/ContactDetail/ContactDetail.tsx';
import { ContactEditForm } from '#/components/Contacts/ContactDetail/ContactEdit/ContactEditForm.tsx';
import { Users } from 'lucide-react';
import { DataState } from '#/components/DataState/DataState.tsx';

export function Contacts() {
  const { data: contacts = [], isLoading, isError } = useGetAllContacts();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setIsEditing(false);
  };

  const showEditForm = selectedContact !== null && isEditing;
  const showDetail = selectedContact !== null && !isEditing;

  return (
    <div className="flex h-full">
      <div className="w-[300px] shrink-0">
        <ContactList
          contacts={contacts}
          selectedId={selectedId}
          onSelect={handleSelect}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className="flex-1 bg-white overflow-y-auto">
        <DataState
          isEmpty={!selectedContact}
          emptyIcon={<Users size={40} className="text-[#E7E5E4]" />}
          emptyText="Sélectionnez un contact"
        >
          {showEditForm && <ContactEditForm contact={selectedContact!} onCancel={() => setIsEditing(false)} />}
          {showDetail && (
            <ContactDetail
              contact={selectedContact!}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setSelectedId(null)}
            />
          )}
        </DataState>
      </div>
    </div>
  );
}
