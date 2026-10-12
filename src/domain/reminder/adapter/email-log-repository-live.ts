import { Effect, Layer, Option } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { EmailLogRepository } from '../port/email-log-repository.ts';
import { toEmailLog, toEmailLogPrismaInput } from './mappers.ts';

export const EmailLogRepositoryLive = Layer.succeed(EmailLogRepository, {
  findById: (id) =>
    Effect.tryPromise({
      try: () => prisma.email_log.findUnique({ where: { id } }),
      catch: toDbError,
    }).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(toEmailLog))),
  listByTargetDate: (targetDate) =>
    Effect.tryPromise({
      try: () => prisma.email_log.findMany({ where: { target_date: targetDate }, orderBy: { id: 'asc' } }),
      catch: toDbError,
    }).pipe(Effect.map((rows) => rows.map(toEmailLog))),
  findLatestTargetDate: () =>
    Effect.tryPromise({
      try: () => prisma.email_log.findFirst({ orderBy: { target_date: 'desc' }, select: { target_date: true } }),
      catch: toDbError,
    }).pipe(Effect.map((row) => Option.fromNullable(row?.target_date))),
  record: (emailLog) => {
    const data = toEmailLogPrismaInput(emailLog);
    return Effect.tryPromise({
      try: () =>
        prisma.email_log.upsert({
          where: { rdv_id_target_date: { rdv_id: data.rdv_id, target_date: data.target_date } },
          create: data,
          update: data,
        }),
      catch: toDbError,
    }).pipe(Effect.map(toEmailLog));
  },
  clearAll: () =>
    Effect.tryPromise({
      try: () => prisma.email_log.deleteMany(),
      catch: toDbError,
    }).pipe(Effect.asVoid),
});
