/** @vitest-environment jsdom */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockContact } from '#/domain/contact/testSupport.ts';
import { useGetContact, useSearchContacts } from '#/services/contactService.ts';
import { useContactSearchSelect } from './useContactSearchSelect.ts';

vi.mock('#/services/contactService.ts', () => ({
  useSearchContacts: vi.fn(),
  useGetContact: vi.fn(),
}));

const jeanDupont = mockContact({ id: 1, firstname: 'Jean', lastname: 'Dupont' });
const marieCurie = mockContact({ id: 2, firstname: 'Marie', lastname: 'Curie' });

const givenSearchResults = (matchingContacts: typeof jeanDupont[], selectedContact: typeof jeanDupont | null) => {
  vi.mocked(useSearchContacts).mockReturnValue({
    data: { pages: [{ items: matchingContacts, nextCursor: null }] },
    isFetching: false,
  } as unknown as ReturnType<typeof useSearchContacts>);
  vi.mocked(useGetContact).mockImplementation(
    (contactId) =>
      ({ data: contactId !== null && contactId === selectedContact?.id ? selectedContact : undefined }) as ReturnType<
        typeof useGetContact
      >,
  );
};

describe('useContactSearchSelect', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('fetches the selected contact and adds it in front when it is not among the matches, so its label stays shown', () => {
    givenSearchResults([jeanDupont], marieCurie);

    const { result } = renderHook(() => useContactSearchSelect(marieCurie.id));

    expect(useGetContact).toHaveBeenLastCalledWith(marieCurie.id);
    expect(result.current.contacts.map((contact) => contact.id)).toEqual([2, 1]);
  });

  it('neither fetches nor duplicates the selected contact when it is already a match', () => {
    givenSearchResults([jeanDupont, marieCurie], marieCurie);

    const { result } = renderHook(() => useContactSearchSelect(marieCurie.id));

    expect(useGetContact).toHaveBeenLastCalledWith(null);
    expect(result.current.contacts.map((contact) => contact.id)).toEqual([1, 2]);
  });

  it('asks for no selected contact when nothing is selected', () => {
    givenSearchResults([jeanDupont], null);

    const { result } = renderHook(() => useContactSearchSelect(undefined));

    expect(useGetContact).toHaveBeenCalledWith(null);
    expect(result.current.contacts.map((contact) => contact.id)).toEqual([1]);
  });
});
