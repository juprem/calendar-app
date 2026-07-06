import { Effect, Layer, Option } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { DayRepository } from '../port/day-repository.ts';
import { toDay, toDayWithRdvs } from './mappers.ts';

const RDV_INCLUDE = { contact: true } as const;

const findByDate = (date: Date) =>
  Effect.tryPromise({ try: () => prisma.day.findFirst({ where: { date } }), catch: toDbError }).pipe(
    Effect.map(Option.fromNullable),
    Effect.map(Option.map(toDay)),
  );

const save = (date: Date) =>
  Effect.tryPromise({ try: () => prisma.day.create({ data: { date } }), catch: toDbError }).pipe(
    Effect.map(toDay),
  );

export const DayRepositoryLive = Layer.succeed(DayRepository, {
  findByDate,
  save,
  findOrCreate: (date) =>
    findByDate(date).pipe(
      Effect.flatMap((existingDay) =>
        Option.match(existingDay, { onNone: () => save(date), onSome: Effect.succeed }),
      ),
    ),
  findWithRdvsByDate: (date) =>
    Effect.tryPromise({
      try: () => prisma.day.findFirst({ where: { date }, include: { rdv: { include: RDV_INCLUDE } } }),
      catch: toDbError,
    }).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(toDayWithRdvs))),
  findManyWithRdvsInRange: (start, end) =>
    Effect.tryPromise({
      try: () =>
        prisma.day.findMany({
          where: { date: { gte: start, lt: end } },
          include: { rdv: { include: RDV_INCLUDE, orderBy: { start_hour: 'asc' } } },
          orderBy: { date: 'asc' },
        }),
      catch: toDbError,
    }).pipe(Effect.map((days) => days.map(toDayWithRdvs))),
});
