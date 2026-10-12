import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '#/configurations/trpc/react.ts';
import { notifyErrorService, notifySuccess } from '#/domain/notifications/runtime.ts';
import { downloadExportFiles } from '#/utils/excel/downloadExportFiles.ts';
import type { ImportResult } from '#/domain/dataTransfer/models.ts';

const sumCounts = (counts: Extract<ImportResult, { status: 'imported' }>['counts'], key: 'created' | 'updated') =>
  counts.practitioners[key] + counts.contacts[key] + counts.rdvs[key];

export const useExportData = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const recordExport = useMutation(trpc.dataTransfer.recordExport.mutationOptions());

  const exportMutation = useMutation({
    mutationFn: async () => {
      const exportData = await queryClient.fetchQuery({
        ...trpc.dataTransfer.getExportData.queryOptions(),
        staleTime: 0,
      });
      await downloadExportFiles(exportData);
      await recordExport.mutateAsync({ exportedAt: exportData.exportedAt });
      return exportData;
    },
    onSuccess: (exportData) =>
      notifySuccess(
        `Export terminé : RDV du ${exportData.sinceLastExportStart ?? 'début'} au ${exportData.today}`,
      ),
    onError: (error) => notifyErrorService(error, "Erreur lors de l'export"),
  });

  return { exportData: exportMutation.mutate, isExporting: exportMutation.isPending };
};

export const useImportData = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.dataTransfer.importData.mutationOptions(),
    onSuccess: (result) => {
      if (result.status !== 'imported') return;
      queryClient.invalidateQueries();
      notifySuccess(
        `Import terminé : ${sumCounts(result.counts, 'created')} créés, ${sumCounts(result.counts, 'updated')} mis à jour`,
      );
    },
    onError: (error) => notifyErrorService(error, "Erreur lors de l'import"),
  });
};
