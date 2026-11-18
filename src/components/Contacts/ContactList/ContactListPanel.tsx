import { ContactListItem } from '#/components/Contacts/ContactList/ContactListItem.tsx';
import { ListSearchInput } from '#/components/SearchableEntityList/ListSearchInput.tsx';
import { VirtualizedList } from '#/components/VirtualizedList/VirtualizedList.tsx';
import { useDebouncedSearch } from '#/hooks/useDebouncedSearch.ts';
import { useSearchContacts } from '#/services/contactService.ts';

const CONTACT_ROW_HEIGHT = 68;

interface ContactListPanelProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ContactListPanel({ selectedId, onSelect }: ContactListPanelProps) {
  const { inputValue, debouncedSearch, setInputValue } = useDebouncedSearch();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSearchContacts(debouncedSearch);
  const contacts = data?.pages.flatMap((page) => page.items) ?? [];

  const loadNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <>
      <ListSearchInput value={inputValue} onChange={setInputValue} placeholder="Rechercher un contact..." />
      <VirtualizedList
        key={debouncedSearch}
        items={contacts}
        estimateSize={CONTACT_ROW_HEIGHT}
        isLoading={isLoading}
        isError={isError && !data}
        emptyText="Aucun contact trouvé"
        onEndReached={loadNextPage}
        renderItem={(contact) => (
          <ContactListItem contact={contact} isSelected={contact.id === selectedId} onSelect={onSelect} />
        )}
      />
    </>
  );
}
