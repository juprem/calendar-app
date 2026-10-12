import type { export_log } from '../../../../generated/prisma/client.ts';
import type { ExportLog } from '../models.ts';

export const toExportLog = (row: export_log): ExportLog => ({
  id: row.id,
  exportedAt: row.exported_at,
});
