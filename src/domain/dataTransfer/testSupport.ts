import { Context, Effect, Layer, Option } from 'effect';
import { DataImportRepository } from './port/data-import-repository.ts';
import { ExportLogRepository } from './port/export-log-repository.ts';
import type { ExportLog } from './models.ts';

export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const mockExportLog = (overrides: Partial<ExportLog> = {}): ExportLog => ({
  id: 1,
  exportedAt: new Date('2026-10-01T10:00:00.000Z'),
  ...overrides,
});

type ExportLogRepositoryShape = Context.Tag.Service<typeof ExportLogRepository>;
type DataImportRepositoryShape = Context.Tag.Service<typeof DataImportRepository>;

export const mockExportLogRepository = (overrides: Partial<ExportLogRepositoryShape> = {}) =>
  Layer.succeed(ExportLogRepository, {
    findLast: () => Effect.succeed(Option.none()),
    record: (exportedAt) => Effect.succeed(mockExportLog({ exportedAt })),
    ...overrides,
  });

export const mockDataImportRepository = (overrides: Partial<DataImportRepositoryShape> = {}) =>
  Layer.succeed(DataImportRepository, {
    applyImport: () =>
      Effect.succeed({
        practitioners: { created: 0, updated: 0 },
        contacts: { created: 0, updated: 0 },
        rdvs: { created: 0, updated: 0 },
      }),
    ...overrides,
  });
