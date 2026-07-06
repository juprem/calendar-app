import { Effect } from 'effect';
import z from 'zod';
import { protectedProcedure } from '#/configurations/trpc/init.ts';
import { CreateGeneralPractitionerSchema, UpdateGeneralPractitionerSchema } from '#/domain/generalPractitioner/models.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { updateGeneralPractitioner } from '#/domain/generalPractitioner/application/mutations/updateGeneralPractitioner/updateGeneralPractitioner.ts';
import { NotFoundError } from '#/effect/errors.ts';
import { catchDomainErrors } from '#/effect/toTRPCError/toTRPCError.ts';
import { runGeneralPractitionerEffect } from '#/domain/generalPractitioner/application/controllers/runtime.ts';

const catchGeneralPractitionerErrors = catchDomainErrors([
  [(cause): cause is NotFoundError => cause instanceof NotFoundError, 'NOT_FOUND'],
]);

const generalPractitionerProcedure = protectedProcedure.use(catchGeneralPractitionerErrors);

export const generalPractitionerRouter = {
  listAll: generalPractitionerProcedure.query(() =>
    runGeneralPractitionerEffect(
      Effect.gen(function* () {
        const generalPractitionerRepository = yield* GeneralPractitionerRepository;
        return yield* generalPractitionerRepository.findAll();
      }),
    ),
  ),
  add: generalPractitionerProcedure.input(CreateGeneralPractitionerSchema).mutation(({ input }) =>
    runGeneralPractitionerEffect(
      Effect.gen(function* () {
        const generalPractitionerRepository = yield* GeneralPractitionerRepository;
        return yield* generalPractitionerRepository.save(input);
      }),
    ),
  ),
  update: generalPractitionerProcedure.input(UpdateGeneralPractitionerSchema).mutation(({ input }) => {
    const { id, ...data } = input;
    return runGeneralPractitionerEffect(updateGeneralPractitioner(id, data));
  }),
  delete: generalPractitionerProcedure.input(z.number()).mutation(({ input }) =>
    runGeneralPractitionerEffect(
      Effect.gen(function* () {
        const generalPractitionerRepository = yield* GeneralPractitionerRepository;
        return yield* generalPractitionerRepository.delete(input);
      }),
    ),
  ),
};
