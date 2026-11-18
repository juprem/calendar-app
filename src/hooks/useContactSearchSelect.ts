import type { Contact } from '#/domain/contact/models.ts';
import { useDebouncedSearch } from '#/hooks/useDebouncedSearch.ts';
import { useGetContact, useSearchContacts } from '#/services/contactService.ts';

interface UseContactSearchSelectResult {
  contacts: Contact[];
  onSearch: (search: string) => void;
  isFetching: boolean;
}

/** Contacts for a server-searched Select: the first page of the contact search, plus the selected contact when it is not among the matches, so its label stays shown. */
export function useContactSearchSelect(selectedContactId: number | null | undefined): UseContactSearchSelectResult {
  const { debouncedSearch, setInputValue } = useDebouncedSearch();
  const { data, isFetching } = useSearchContacts(debouncedSearch);
  const matchingContacts = data?.pages[0]?.items ?? [];
  const isSelectedContactMissing =
    selectedContactId != null && !matchingContacts.some((contact) => contact.id === selectedContactId);
  const { data: missingSelectedContact } = useGetContact(isSelectedContactMissing ? selectedContactId : null);
  const contacts = missingSelectedContact ? [missingSelectedContact, ...matchingContacts] : matchingContacts;

  return { contacts, onSearch: setInputValue, isFetching };
}
