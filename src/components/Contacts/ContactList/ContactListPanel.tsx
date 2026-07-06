import type { Contact } from '#/domain/contact/models.ts';
import { SearchableEntityList } from '#/components/SearchableEntityList/SearchableEntityList.tsx';
import { ContactListItem } from '#/components/Contacts/ContactList/ContactListItem.tsx';

const CONTACT_ROW_HEIGHT = 68;

interface ContactListPanelProps {
  contacts: Contact[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ContactListPanel({ contacts, selectedId, onSelect, isLoading = false, isError = false }: ContactListPanelProps) {
  return (
    <SearchableEntityList
      items={contacts}
      getSearchableName={(contact) => contact}
      estimateSize={CONTACT_ROW_HEIGHT}
      isLoading={isLoading}
      isError={isError}
      emptyText="Aucun contact trouvé"
      searchPlaceholder="Rechercher un contact..."
      renderItem={(contact) => (
        <ContactListItem contact={contact} isSelected={contact.id === selectedId} onSelect={onSelect} />
      )}
    />
  );
}
