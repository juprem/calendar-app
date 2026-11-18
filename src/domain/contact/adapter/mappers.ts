import type { contact, Prisma, rdv } from '../../../../generated/prisma/client.ts';
import type { Contact, CreateContact, RdvHistoryEntry, UpdateContact } from '../models.ts';
// calendar owns toRdvWithContact; reused here rather than re-mapping every rdv field — calendar's mapper
// reuses toContact above for the same reason. An intentional two-file cycle, safe: pure functions only,
// nothing invoked at module load time.
import { toRdvWithContact } from '#/domain/calendar/adapter/mappers.ts';

export const toContact = (contactRow: contact): Contact => ({
  id: contactRow.id,
  firstname: contactRow.firstname,
  lastname: contactRow.lastname,
  email: contactRow.email,
  phoneNumber: contactRow.phone_number,
  notes: contactRow.notes,
  birthDate: contactRow.birth_date,
  birthLocation: contactRow.birth_location,
  address: contactRow.address,
  civility: contactRow.civility,
  generalPractitionerId: contactRow.general_practitioner_id,
});

export const toContactPrismaInput = (data: (CreateContact | Omit<UpdateContact, 'id'>) & { birthDate: Date }) => ({
  civility: data.civility,
  firstname: data.firstname,
  lastname: data.lastname,
  email: data.email,
  phone_number: data.phoneNumber,
  notes: data.notes,
  birth_date: data.birthDate,
  birth_location: data.birthLocation,
  address: data.address,
  general_practitioner_id: data.generalPractitionerId,
});

export const toRdvHistoryEntry = (
  rdvRow: rdv & { day: { date: Date }; contact: contact | null },
): RdvHistoryEntry => ({
  ...toRdvWithContact(rdvRow),
  day: { date: rdvRow.day.date },
});

/** Prisma filter for the contact search rule of features/contacts/SPEC.md §2, the server mirror of `matchesNameQuery` in `#/utils/contactUtils.ts`: case-insensitive prefix of the first name, the last name, or "first name last name" (one alternative per space in the query). */
export const toContactNameSearchWhere = (query: string): Prisma.contactWhereInput => {
  if (query === '') return {};
  const fullNameAlternatives = [...query.matchAll(/ /g)].map((spaceMatch) => ({
    firstname: { equals: query.slice(0, spaceMatch.index), mode: 'insensitive' as const },
    lastname: { startsWith: query.slice(spaceMatch.index + 1), mode: 'insensitive' as const },
  }));
  return {
    OR: [
      { firstname: { startsWith: query, mode: 'insensitive' } },
      { lastname: { startsWith: query, mode: 'insensitive' } },
      ...fullNameAlternatives,
    ],
  };
};
