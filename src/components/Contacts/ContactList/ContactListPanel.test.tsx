/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockContact } from '#/domain/contact/testSupport.ts';
import { useSearchContacts } from '#/services/contactService.ts';
import { ContactListPanel } from './ContactListPanel.tsx';

vi.mock('#/services/contactService.ts', () => ({ useSearchContacts: vi.fn() }));

const givenSearchState = (state: { contactCount: number; hasNextPage: boolean; isFetchingNextPage?: boolean; isError?: boolean }) => {
  const fetchNextPage = vi.fn();
  const items = Array.from({ length: state.contactCount }, (_, contactIndex) =>
    mockContact({ id: contactIndex + 1, firstname: 'Jean', lastname: `Dupont ${contactIndex + 1}` }),
  );
  vi.mocked(useSearchContacts).mockReturnValue({
    data: state.isError && items.length === 0 ? undefined : { pages: [{ items, nextCursor: null }] },
    isLoading: false,
    isError: state.isError ?? false,
    hasNextPage: state.hasNextPage,
    isFetchingNextPage: state.isFetchingNextPage ?? false,
    fetchNextPage,
  } as unknown as ReturnType<typeof useSearchContacts>);
  return fetchNextPage;
};

const renderPanel = () => render(<ContactListPanel selectedId={null} onSelect={vi.fn()} />);

const SCROLL_VIEWPORT_HEIGHT = 400;

describe('ContactListPanel', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(SCROLL_VIEWPORT_HEIGHT);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('loads the next page once the last loaded contact is rendered and more matches follow', () => {
    const fetchNextPage = givenSearchState({ contactCount: 2, hasNextPage: true });

    renderPanel();

    expect(screen.getByText('Jean Dupont 2')).toBeTruthy();
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('does not load another page when no more matches follow', () => {
    const fetchNextPage = givenSearchState({ contactCount: 2, hasNextPage: false });

    renderPanel();

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not load another page while one is already loading', () => {
    const fetchNextPage = givenSearchState({ contactCount: 2, hasNextPage: true, isFetchingNextPage: true });

    renderPanel();

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('keeps the loaded contacts when a next page fails', () => {
    givenSearchState({ contactCount: 2, hasNextPage: true, isError: true });

    renderPanel();

    expect(screen.getByText('Jean Dupont 1')).toBeTruthy();
    expect(screen.queryByText('Une erreur est survenue')).toBeNull();
  });

  it('shows the empty text when no contact matches', () => {
    givenSearchState({ contactCount: 0, hasNextPage: false });

    renderPanel();

    expect(screen.getByText('Aucun contact trouvé')).toBeTruthy();
  });
});
