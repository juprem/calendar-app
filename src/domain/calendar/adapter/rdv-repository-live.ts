import { Effect, Layer, Option } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { RdvRepository } from '../port/rdv-repository.ts';
import { toRdv, toRdvPrismaInput } from './mappers.ts';

export const RdvRepositoryLive = Layer.succeed(RdvRepository, {
  findById: (id) =>
    Effect.tryPromise({ try: () => prisma.rdv.findUnique({ where: { id } }), catch: toDbError }).pipe(
      Effect.map(Option.fromNullable),
      Effect.map(Option.map(toRdv)),
    ),
  findByDayId: (dayId) =>
    Effect.tryPromise({ try: () => prisma.rdv.findMany({ where: { day_id: dayId } }), catch: toDbError }).pipe(
      Effect.map((rdvs) => rdvs.map(toRdv)),
    ),
  save: (data) =>
    Effect.tryPromise({ try: () => prisma.rdv.create({ data: toRdvPrismaInput(data) }), catch: toDbError }).pipe(
      Effect.map(toRdv),
    ),
  update: (id, data) =>
    Effect.tryPromise({
      try: () => prisma.rdv.update({ where: { id }, data: toRdvPrismaInput(data) }),
      catch: toDbError,
    }).pipe(Effect.map(toRdv)),
  delete: (id) =>
    Effect.tryPromise({ try: () => prisma.rdv.delete({ where: { id } }), catch: toDbError }).pipe(
      Effect.map(toRdv),
    ),
});
