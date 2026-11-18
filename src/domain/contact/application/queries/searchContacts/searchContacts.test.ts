import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { CONTACT_PAGE_SIZE } from '#/domain/contact/models.ts';
import { mockContact, mockContactRepository } from '#/domain/contact/testSupport.ts';
import { searchContacts } from './searchContacts.ts';

const contactsWithIds = (count: number) => Array.from({ length: count }, (_, contactIndex) => mockContact({ id: contactIndex + 1 }));

describe('searchContacts', () => {
  it('asks the repository for one row more than a page, at the given offset', async () => {
    const search = vi.fn(() => Effect.succeed([]));

    await Effect.runPromise(searchContacts('jea', 100).pipe(Effect.provide(mockContactRepository({ search }))));

    expect(search).toHaveBeenCalledWith('jea', 100, CONTACT_PAGE_SIZE + 1);
  });

  it.each([
    { rowCount: CONTACT_PAGE_SIZE + 1, offset: 50, expectedItemCount: CONTACT_PAGE_SIZE, expectedNextCursor: 50 + CONTACT_PAGE_SIZE },
    { rowCount: CONTACT_PAGE_SIZE, offset: 0, expectedItemCount: CONTACT_PAGE_SIZE, expectedNextCursor: null },
    { rowCount: 20, offset: 100, expectedItemCount: 20, expectedNextCursor: null },
  ])(
    'returns $expectedItemCount items and next cursor $expectedNextCursor when the repository returns $rowCount rows',
    async ({ rowCount, offset, expectedItemCount, expectedNextCursor }) => {
      const layer = mockContactRepository({ search: () => Effect.succeed(contactsWithIds(rowCount)) });

      const page = await Effect.runPromise(searchContacts('', offset).pipe(Effect.provide(layer)));

      expect(page.items).toHaveLength(expectedItemCount);
      expect(page.items.at(-1)?.id).toBe(expectedItemCount);
      expect(page.nextCursor).toBe(expectedNextCursor);
    },
  );
});
