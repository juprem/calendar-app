import type { ExportData } from '#/domain/dataTransfer/models.ts';
import {
  CONTACTS_FILE_NAME,
  CONTACT_COLUMNS,
  PRACTITIONERS_FILE_NAME,
  PRACTITIONER_COLUMNS,
  RDV_COLUMNS,
  ROLLING_RDV_FILE_NAME,
  buildWriteColumns,
  exportZipFileName,
  rdvSinceLastExportFileName,
  type ExcelColumn,
} from './excelColumns.ts';

const DOWNLOAD_URL_LIFETIME_MS = 60_000;

export async function buildExportZip(exportData: ExportData): Promise<Uint8Array> {
  const [{ default: writeExcelFile }, { zipSync }] = await Promise.all([
    import('write-excel-file/browser'),
    import('fflate'),
  ]);
  const toExcelBytes = async <Field extends string, Row extends Record<Field, unknown>>(
    rows: Row[],
    columns: readonly ExcelColumn<Field>[],
  ) => {
    const excelBlob = await writeExcelFile(rows, { columns: buildWriteColumns<Field, Row>(columns) }).toBlob();
    return new Uint8Array(await excelBlob.arrayBuffer());
  };

  const [rdvSinceLastExport, rdvRolling, contacts, practitioners] = await Promise.all([
    toExcelBytes(exportData.rdvSinceLastExport, RDV_COLUMNS),
    toExcelBytes(exportData.rdvRolling, RDV_COLUMNS),
    toExcelBytes(exportData.contacts, CONTACT_COLUMNS),
    toExcelBytes(exportData.practitioners, PRACTITIONER_COLUMNS),
  ]);

  return zipSync(
    {
      [rdvSinceLastExportFileName(exportData.sinceLastExportStart, exportData.today)]: rdvSinceLastExport,
      [ROLLING_RDV_FILE_NAME]: rdvRolling,
      [CONTACTS_FILE_NAME]: contacts,
      [PRACTITIONERS_FILE_NAME]: practitioners,
    },
    { level: 0 },
  );
}

export async function downloadExportZip(exportData: ExportData): Promise<void> {
  const zipBytes = await buildExportZip(exportData);
  const downloadUrl = URL.createObjectURL(new Blob([new Uint8Array(zipBytes)], { type: 'application/zip' }));
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = exportZipFileName(exportData.today);
  downloadLink.click();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), DOWNLOAD_URL_LIFETIME_MS);
}
