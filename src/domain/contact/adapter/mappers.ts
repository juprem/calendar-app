import type { contact, rdv } from '../../../../generated/prisma/client.ts';
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

export const toContactPrismaInput = (data: CreateContact | Omit<UpdateContact, 'id'>) => ({
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
