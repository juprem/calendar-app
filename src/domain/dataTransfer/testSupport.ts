import { Context, Effect, Layer, Option } from 'effect';
import { ExportLogRepository } from './port/export-log-repository.ts';
import type { ExportLog } from './models.ts';

export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const mockExportLog = (overrides: Partial<ExportLog> = {}): ExportLog => ({
  id: 1,
  exportedAt: new Date('2026-10-01T10:00:00.000Z'),
  ...overrides,
});

type ExportLogRepositoryShape = Context.Tag.Service<typeof ExportLogRepository>;

export const mockExportLogRepository = (overrides: Partial<ExportLogRepositoryShape> = {}) =>
  Layer.succeed(ExportLogRepository, {
    findLast: () => Effect.succeed(Option.none()),
    record: (exportedAt) => Effect.succeed(mockExportLog({ exportedAt })),
    ...overrides,
  });
