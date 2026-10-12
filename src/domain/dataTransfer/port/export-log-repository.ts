import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { ExportLog } from '../models.ts';

export class ExportLogRepository extends Context.Tag('ExportLogRepository')<
  ExportLogRepository,
  {
    readonly findLast: () => Effect.Effect<Option.Option<ExportLog>, DbError>;
    readonly record: (exportedAt: Date) => Effect.Effect<ExportLog, DbError>;
  }
>() {}
