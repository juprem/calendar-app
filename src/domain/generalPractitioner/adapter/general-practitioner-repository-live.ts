import { Effect, Layer, Option } from 'effect';
import { Prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { GeneralPractitionerRepository } from '../port/general-practitioner-repository.ts';
import { toGeneralPractitioner } from './mappers.ts';

export const GeneralPractitionerRepositoryLive = Layer.effect(
  GeneralPractitionerRepository,
  Effect.gen(function* () {
    const prisma = yield* Prisma;
    return {
      findById: (id) =>
        Effect.tryPromise({
          try: () => prisma.general_practitioner.findUnique({ where: { id } }),
          catch: toDbError,
        }).pipe(Effect.map(Option.fromNullishOr), Effect.map(Option.map(toGeneralPractitioner))),
      findAll: () =>
        Effect.tryPromise({
          try: () => prisma.general_practitioner.findMany({ orderBy: { lastname: 'asc' } }),
          catch: toDbError,
        }).pipe(Effect.map((rows) => rows.map(toGeneralPractitioner))),
      save: (data) =>
        Effect.tryPromise({ try: () => prisma.general_practitioner.create({ data }), catch: toDbError }).pipe(
          Effect.map(toGeneralPractitioner),
        ),
      update: (id, data) =>
        Effect.tryPromise({
          try: () => prisma.general_practitioner.update({ where: { id }, data }),
          catch: toDbError,
        }).pipe(Effect.map(toGeneralPractitioner)),
      delete: (id) =>
        Effect.tryPromise({ try: () => prisma.general_practitioner.delete({ where: { id } }), catch: toDbError }).pipe(
          Effect.map(toGeneralPractitioner),
        ),
    };
  }),
);
