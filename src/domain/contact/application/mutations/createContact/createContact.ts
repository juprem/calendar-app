import { Effect } from 'effect';
import { ensureFullNameIsAvailable, ensureGeneralPractitionerExists } from '../contactConstraints/contactConstraints.ts';
import type { CreateContact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';

export const createContact = (data: CreateContact) =>
  Effect.gen(function* () {
    yield* ensureFullNameIsAvailable(data.firstname, data.lastname);
    yield* ensureGeneralPractitionerExists(data.generalPractitionerId);

    const contactRepository = yield* ContactRepository;
    return yield* contactRepository.save(data);
  });
