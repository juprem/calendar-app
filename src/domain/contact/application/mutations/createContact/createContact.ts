import { Effect } from 'effect';
import { ensureIdentityIsAvailable, resolveBirthDate, ensureGeneralPractitionerExists } from '../contactConstraints/contactConstraints.ts';
import type { CreateContact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';

export const createContact = (data: CreateContact) =>
  Effect.gen(function* () {
    const birthDate = yield* resolveBirthDate(data.firstname, data.lastname, data.birthDate);
    yield* ensureIdentityIsAvailable(data.firstname, data.lastname, birthDate);
    yield* ensureGeneralPractitionerExists(data.generalPractitionerId);

    const contactRepository = yield* ContactRepository;
    return yield* contactRepository.save({ ...data, birthDate });
  });
