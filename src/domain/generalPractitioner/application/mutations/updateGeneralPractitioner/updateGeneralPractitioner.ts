import { Effect, Option } from 'effect';
import { NotFoundError } from '#/effect/errors.ts';
import type { UpdateGeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';

export const updateGeneralPractitioner = (id: number, data: Omit<UpdateGeneralPractitioner, 'id'>) =>
  Effect.gen(function* () {
    const generalPractitionerRepository = yield* GeneralPractitionerRepository;

    const existingGeneralPractitioner = yield* generalPractitionerRepository.findById(id);
    if (Option.isNone(existingGeneralPractitioner)) {
      return yield* Effect.fail(new NotFoundError({ message: `Médecin traitant introuvable (id ${id})` }));
    }

    return yield* generalPractitionerRepository.update(id, data);
  });
