import { Context, Effect } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { ImportCount, ImportData, ImportEntity } from '../models.ts';

export class DataImportRepository extends Context.Service<
  DataImportRepository,
  {
    readonly applyImport: (data: ImportData) => Effect.Effect<Record<ImportEntity, ImportCount>, DbError>;
  }
>()('DataImportRepository') {}
