import { Effect } from 'effect';
import { protectedProcedure } from '#/configurations/trpc/init.ts';
import { catchDomainErrors } from '#/effect/toTRPCError/toTRPCError.ts';
import { ImportDataSchema, RecordExportSchema } from '../../models.ts';
import { ExportLogRepository } from '../../port/export-log-repository.ts';
import { importData } from '../mutations/importData/importData.ts';
import { getExportData } from '../queries/getExportData/getExportData.ts';
import { runDataTransferEffect } from './runtime.ts';

const dataTransferProcedure = protectedProcedure.use(catchDomainErrors([]));

export const dataTransferRouter = {
  getExportData: dataTransferProcedure.query(() => runDataTransferEffect(getExportData(new Date()))),
  recordExport: dataTransferProcedure.input(RecordExportSchema).mutation(({ input }) =>
    runDataTransferEffect(
      Effect.gen(function* () {
        const exportLogRepository = yield* ExportLogRepository;
        return yield* exportLogRepository.record(input.exportedAt);
      }),
    ),
  ),
  importData: dataTransferProcedure
    .input(ImportDataSchema)
    .mutation(({ input }) => runDataTransferEffect(importData(input))),
};
