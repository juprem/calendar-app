import { useState } from 'react';
import { useGetContact } from '#/services/contactService.ts';
import { ContactList } from '#/components/Contacts/ContactList/ContactList.tsx';
import { ContactDetail } from '#/components/Contacts/ContactDetail/ContactDetail.tsx';
import { ContactEditForm } from '#/components/Contacts/ContactDetail/ContactEdit/ContactEditForm.tsx';
import { Users } from 'lucide-react';
import { DataState } from '#/components/DataState/DataState.tsx';

export function Contacts() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { data: fetchedContact, isLoading, isError } = useGetContact(selectedId);
  const selectedContact = fetchedContact ?? null;

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setIsEditing(false);
  };

  const showEditForm = selectedContact !== null && isEditing;
  const showDetail = selectedContact !== null && !isEditing;

  return (
    <div className="flex h-full">
      <div className="w-[300px] shrink-0">
        <ContactList selectedId={selectedId} onSelect={handleSelect} />
      </div>

      <div className="flex-1 bg-white overflow-y-auto">
        <DataState
          isLoading={isLoading}
          isError={isError}
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
