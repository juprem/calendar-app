import { Effect, Layer, Option } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { ExportLogRepository } from '../port/export-log-repository.ts';
import { toExportLog } from './mappers.ts';

export const ExportLogRepositoryLive = Layer.succeed(ExportLogRepository, {
  findLast: () =>
    Effect.tryPromise({
      try: () => prisma.export_log.findFirst({ orderBy: { exported_at: 'desc' } }),
      catch: toDbError,
    }).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(toExportLog))),
  record: (exportedAt) =>
    Effect.tryPromise({
      try: () => prisma.export_log.create({ data: { exported_at: exportedAt } }),
      catch: toDbError,
    }).pipe(Effect.map(toExportLog)),
});
