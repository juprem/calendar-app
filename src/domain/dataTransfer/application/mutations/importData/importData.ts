import { Effect } from 'effect';
import type { Contact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { truncateToUTCDate } from '#/utils/dateUtils.ts';
import {
  toExcelRowNumber,
  type ImportData,
  type ImportEntity,
  type ImportResult,
  type ImportRowError,
} from '../../../models.ts';
import { DataImportRepository } from '../../../port/data-import-repository.ts';

const toBirthDay = (birthDate: Date): string => truncateToUTCDate(birthDate).toISOString().slice(0, 10);

const toIdentityKey = (contact: Pick<Contact, 'firstname' | 'lastname' | 'birthDate'>): string =>
  JSON.stringify([contact.firstname, contact.lastname, toBirthDay(contact.birthDate)]);

const errorsWhere = <Row>(
  entity: ImportEntity,
  rows: readonly Row[],
  reasonOf: (row: Row) => string | null,
): ImportRowError[] =>
  rows.flatMap((row, rowIndex) => {
    const reason = reasonOf(row);
    return reason === null ? [] : [{ entity, rowNumber: toExcelRowNumber(rowIndex), reason }];
  });

const findDuplicateIdErrors = (entity: ImportEntity, rows: readonly { id: number }[]): ImportRowError[] => {
  const seenIds = new Set<number>();
  return errorsWhere(entity, rows, (row) => {
    if (seenIds.has(row.id)) return `Identifiant ${row.id} en doublon dans le fichier`;
    seenIds.add(row.id);
    return null;
  });
};

const findIdentityConflictErrors = (data: ImportData, existingContacts: readonly Contact[]): ImportRowError[] => {
  const importedContactIds = new Set(data.contacts.map((contact) => contact.id));
  const identityKeyOccurrences = new Map<string, number>();
  const finalContacts = [
    ...existingContacts.filter((contact) => !importedContactIds.has(contact.id)),
    ...data.contacts,
  ];
  finalContacts.forEach((contact) => {
    const identityKey = toIdentityKey(contact);
    identityKeyOccurrences.set(identityKey, (identityKeyOccurrences.get(identityKey) ?? 0) + 1);
  });

  return errorsWhere('contacts', data.contacts, (contact) =>
    (identityKeyOccurrences.get(toIdentityKey(contact)) ?? 0) > 1
      ? `Contact en doublon : ${contact.firstname} ${contact.lastname} né(e) le ${toBirthDay(contact.birthDate)}`
      : null,
  );
};

export const validateImport = (
  data: ImportData,
  existingContacts: readonly Contact[],
  existingPractitioners: readonly GeneralPractitioner[],
): ImportRowError[] => {
  const knownPractitionerIds = new Set([
    ...existingPractitioners.map((practitioner) => practitioner.id),
    ...data.practitioners.map((practitioner) => practitioner.id),
  ]);
  const knownContactIds = new Set([
    ...existingContacts.map((contact) => contact.id),
    ...data.contacts.map((contact) => contact.id),
  ]);

  return [
    ...findDuplicateIdErrors('practitioners', data.practitioners),
    ...findDuplicateIdErrors('contacts', data.contacts),
    ...findDuplicateIdErrors('rdvs', data.rdvs),
    ...errorsWhere('contacts', data.contacts, (contact) =>
      contact.generalPractitionerId !== null && !knownPractitionerIds.has(contact.generalPractitionerId)
        ? `Médecin traitant ${contact.generalPractitionerId} introuvable`
        : null,
    ),
    ...errorsWhere('rdvs', data.rdvs, (rdv) =>
      rdv.contactId !== null && !knownContactIds.has(rdv.contactId) ? `Contact ${rdv.contactId} introuvable` : null,
    ),
    ...findIdentityConflictErrors(data, existingContacts),
  ];
};

export const importData = (data: ImportData) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;
    const generalPractitionerRepository = yield* GeneralPractitionerRepository;
    const dataImportRepository = yield* DataImportRepository;

    const { existingContacts, existingPractitioners } = yield* Effect.all(
      { existingContacts: contactRepository.findAll(), existingPractitioners: generalPractitionerRepository.findAll() },
      { concurrency: 'unbounded' },
    );

    const errors = validateImport(data, existingContacts, existingPractitioners);
    if (errors.length > 0) return { status: 'rejected', errors } satisfies ImportResult;

    const counts = yield* dataImportRepository.applyImport(data);
    return { status: 'imported', counts } satisfies ImportResult;
  });
