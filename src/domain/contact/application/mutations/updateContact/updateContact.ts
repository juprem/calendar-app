import { Effect, Option } from 'effect';
import { NotFoundError } from '#/effect/errors.ts';
import { ensureIdentityIsAvailable, resolveBirthDate, ensureGeneralPractitionerExists } from '../contactConstraints/contactConstraints.ts';
import type { UpdateContact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';

export const updateContact = (id: number, data: Omit<UpdateContact, 'id'>) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;

    const existingContact = yield* contactRepository.findById(id);
    if (Option.isNone(existingContact)) {
      return yield* Effect.fail(new NotFoundError({ message: `Contact introuvable (id ${id})` }));
    }

    const birthDate = yield* resolveBirthDate(data.firstname, data.lastname, data.birthDate, id);
    yield* ensureIdentityIsAvailable(data.firstname, data.lastname, birthDate, id);
    yield* ensureGeneralPractitionerExists(data.generalPractitionerId);

    return yield* contactRepository.update(id, { ...data, birthDate });
  });
