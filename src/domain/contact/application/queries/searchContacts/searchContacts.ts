import { Effect } from 'effect';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { CONTACT_PAGE_SIZE } from '#/domain/contact/models.ts';

/** One page of the contact search: reads one extra row to know whether a next page exists, whose cursor is the offset to resume from. */
export const searchContacts = (query: string, offset: number) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;
    const contacts = yield* contactRepository.search(query, offset, CONTACT_PAGE_SIZE + 1);
    const hasNextPage = contacts.length > CONTACT_PAGE_SIZE;
    return {
      items: contacts.slice(0, CONTACT_PAGE_SIZE),
      nextCursor: hasNextPage ? offset + CONTACT_PAGE_SIZE : null,
    };
  });
