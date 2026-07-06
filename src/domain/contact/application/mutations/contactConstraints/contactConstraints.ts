import { Effect, Option } from 'effect';
import { ContactConflictError, NotFoundError } from '#/effect/errors.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';

export const ensureFullNameIsAvailable = (firstname: string, lastname: string, excludingContactId?: number) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;
    const contactWithSameFullName = yield* contactRepository.findByFullName(firstname, lastname);

    if (Option.isSome(contactWithSameFullName) && contactWithSameFullName.value.id !== excludingContactId) {
      return yield* Effect.fail(
        new ContactConflictError({ message: `Un contact "${firstname} ${lastname}" existe déjà` }),
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
