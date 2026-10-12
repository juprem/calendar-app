import { Effect } from 'effect';
import type { Contact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { truncateToUTCDate } from '#/utils/dateUtils.ts';
import type { ImportData, ImportEntity, ImportResult, ImportRowError } from '../../../models.ts';
import { DataImportRepository } from '../../../port/data-import-repository.ts';

const FIRST_DATA_ROW_NUMBER = 2;

const toRowNumber = (rowIndex: number): number => rowIndex + FIRST_DATA_ROW_NUMBER;

const toBirthDay = (birthDate: Date): string => truncateToUTCDate(birthDate).toISOString().slice(0, 10);

const toIdentityKey = (contact: Pick<Contact, 'firstname' | 'lastname' | 'birthDate'>): string =>
  JSON.stringify([contact.firstname, contact.lastname, toBirthDay(contact.birthDate)]);

const findDuplicateIdErrors = (entity: ImportEntity, rows: readonly { id: number }[]): ImportRowError[] => {
  const seenIds = new Set<number>();
  return rows.flatMap((row, rowIndex) => {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      return [];
    }
    return [{ entity, rowNumber: toRowNumber(rowIndex), reason: `Identifiant ${row.id} en doublon dans le fichier` }];
  });
};

const findIdentityConflictErrors = (
  data: ImportData,
  existingContacts: readonly Contact[],
): ImportRowError[] => {
  const importedContactIds = new Set(data.contacts.map((contact) => contact.id));
  const identityKeyOccurrences = new Map<string, number>();
  const countIdentity = (contact: Contact | ImportData['contacts'][number]) => {
    const identityKey = toIdentityKey(contact);
    identityKeyOccurrences.set(identityKey, (identityKeyOccurrences.get(identityKey) ?? 0) + 1);
  };

  existingContacts.filter((contact) => !importedContactIds.has(contact.id)).forEach(countIdentity);
  data.contacts.forEach(countIdentity);

  return data.contacts.flatMap<ImportRowError>((contact, contactIndex) =>
    (identityKeyOccurrences.get(toIdentityKey(contact)) ?? 0) > 1
      ? [
          {
            entity: 'contacts',
            rowNumber: toRowNumber(contactIndex),
            reason: `Contact en doublon : ${contact.firstname} ${contact.lastname} né(e) le ${toBirthDay(contact.birthDate)}`,
          },
        ]
      : [],
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

  const unknownPractitionerErrors = data.contacts.flatMap<ImportRowError>((contact, contactIndex) =>
    contact.generalPractitionerId !== null && !knownPractitionerIds.has(contact.generalPractitionerId)
      ? [
          {
            entity: 'contacts',
            rowNumber: toRowNumber(contactIndex),
            reason: `Médecin traitant ${contact.generalPractitionerId} introuvable`,
          },
        ]
      : [],
  );

  const unknownContactErrors = data.rdvs.flatMap<ImportRowError>((rdv, rdvIndex) =>
    rdv.contactId !== null && !knownContactIds.has(rdv.contactId)
      ? [
          {
            entity: 'rdvs',
            rowNumber: toRowNumber(rdvIndex),
            reason: `Contact ${rdv.contactId} introuvable`,
          },
        ]
      : [],
  );

  return [
    ...findDuplicateIdErrors('practitioners', data.practitioners),
    ...findDuplicateIdErrors('contacts', data.contacts),
    ...findDuplicateIdErrors('rdvs', data.rdvs),
    ...unknownPractitionerErrors,
    ...unknownContactErrors,
    ...findIdentityConflictErrors(data, existingContacts),
  ];
};

export const importData = (data: ImportData) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;
    const generalPractitionerRepository = yield* GeneralPractitionerRepository;
    const dataImportRepository = yield* DataImportRepository;

    const existingContacts = yield* contactRepository.findAll();
    const existingPractitioners = yield* generalPractitionerRepository.findAll();

    const errors = validateImport(data, existingContacts, existingPractitioners);
    if (errors.length > 0) return { status: 'rejected', errors } satisfies ImportResult;

    const counts = yield* dataImportRepository.applyImport(data);
    return { status: 'imported', counts } satisfies ImportResult;
  });
