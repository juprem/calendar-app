import type { ExportData } from '#/domain/dataTransfer/models.ts';
import {
  CONTACTS_FILE_NAME,
  CONTACT_COLUMNS,
  PRACTITIONERS_FILE_NAME,
  PRACTITIONER_COLUMNS,
  RDV_COLUMNS,
  ROLLING_RDV_FILE_NAME,
  buildWriteColumns,
  rdvSinceLastExportFileName,
} from './excelColumns.ts';

export async function downloadExportFiles(exportData: ExportData): Promise<void> {
  const { default: writeExcelFile } = await import('write-excel-file/browser');

  await writeExcelFile(exportData.rdvSinceLastExport, {
    columns: buildWriteColumns(RDV_COLUMNS),
  }).toFile(rdvSinceLastExportFileName(exportData.sinceLastExportStart, exportData.today));
  await writeExcelFile(exportData.rdvRolling, {
    columns: buildWriteColumns(RDV_COLUMNS),
  }).toFile(ROLLING_RDV_FILE_NAME);
  await writeExcelFile(exportData.contacts, {
    columns: buildWriteColumns(CONTACT_COLUMNS),
  }).toFile(CONTACTS_FILE_NAME);
  await writeExcelFile(exportData.practitioners, {
    columns: buildWriteColumns(PRACTITIONER_COLUMNS),
  }).toFile(PRACTITIONERS_FILE_NAME);
}
