import { Effect, Layer, Option } from 'effect';
import { Prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { ExportLogRepository } from '../port/export-log-repository.ts';
import { toExportLog } from './mappers.ts';

export const ExportLogRepositoryLive = Layer.effect(
  ExportLogRepository,
  Effect.gen(function* () {
    const prisma = yield* Prisma;
    return {
      findLast: () =>
        Effect.tryPromise({
          try: () => prisma.export_log.findFirst({ orderBy: { exported_at: 'desc' } }),
          catch: toDbError,
        }).pipe(Effect.map(Option.fromNullishOr), Effect.map(Option.map(toExportLog))),
      record: (exportedAt) =>
        Effect.tryPromise({
          try: () => prisma.export_log.create({ data: { exported_at: exportedAt } }),
          catch: toDbError,
        }).pipe(Effect.map(toExportLog)),
    };
  }),
);
