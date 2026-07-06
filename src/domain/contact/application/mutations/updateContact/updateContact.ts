import { Effect, Option } from 'effect';
import { NotFoundError } from '#/effect/errors.ts';
import { ensureFullNameIsAvailable, ensureGeneralPractitionerExists } from '../contactConstraints/contactConstraints.ts';
import type { UpdateContact } from '#/domain/contact/models.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';

export const updateContact = (id: number, data: Omit<UpdateContact, 'id'>) =>
  Effect.gen(function* () {
    const contactRepository = yield* ContactRepository;

    const existingContact = yield* contactRepository.findById(id);
    if (Option.isNone(existingContact)) {
      return yield* Effect.fail(new NotFoundError({ message: `Contact introuvable (id ${id})` }));
    }

    yield* ensureFullNameIsAvailable(data.firstname, data.lastname, id);
    yield* ensureGeneralPractitionerExists(data.generalPractitionerId);

    return yield* contactRepository.update(id, data);
  });
