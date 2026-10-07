import { Effect, Option } from 'effect';
import { ContactBirthDateRequiredError, ContactConflictError, NotFoundError } from '#/effect/errors.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { truncateToUTCDate } from '#/utils/dateUtils.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';

export const resolveBirthDate = (
  firstname: string,
  lastname: string,
  birthDate: Date | undefined,
  excludingContactId?: number,
) =>
  Effect.gen(function* () {
    if (birthDate) return birthDate;

    const contactRepository = yield* ContactRepository;
    const contactsWithSameName = yield* contactRepository.findByName(firstname, lastname);
    const hasHomonym = contactsWithSameName.some((contact) => contact.id !== excludingContactId);

    if (hasHomonym) {
      return yield* Effect.fail(
        new ContactBirthDateRequiredError({
          message: `Un contact "${firstname} ${lastname}" existe déjà : la date de naissance est obligatoire`,
        }),
      );
    }

    return truncateToUTCDate(new Date());
  });

export const ensureIdentityIsAvailable = (
  firstname: string,
  lastname: string,
  birthDate: Date,
  excludingContactId?: number,
) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;
    const contactWithSameIdentity = yield* contactRepository.findByIdentity(firstname, lastname, birthDate);

    if (Option.isSome(contactWithSameIdentity) && contactWithSameIdentity.value.id !== excludingContactId) {
      const formattedBirthDate = birthDate.toLocaleDateString('fr-FR', { timeZone: 'UTC' });
      return yield* Effect.fail(
        new ContactConflictError({
          message: `Un contact "${firstname} ${lastname}" né le ${formattedBirthDate} existe déjà`,
        }),
      );
    }
  });

export const ensureGeneralPractitionerExists = (generalPractitionerId: number | null | undefined) =>
  Effect.gen(function* () {
    if (generalPractitionerId == null) return;

    const generalPractitionerRepository = yield* GeneralPractitionerRepository;
    const generalPractitioner = yield* generalPractitionerRepository.findById(generalPractitionerId);

    if (Option.isNone(generalPractitioner)) {
      return yield* Effect.fail(
        new NotFoundError({ message: `Médecin traitant introuvable (id ${generalPractitionerId})` }),
      );
    }
  });
