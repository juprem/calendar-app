import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import type { ExportData } from '#/domain/dataTransfer/models.ts';
import { buildExportZip } from './downloadExportZip.ts';
import { parseImportFile } from './parseImportFile.ts';

const exportData: ExportData = {
  exportedAt: new Date('2026-10-12T10:00:00.000Z'),
  sinceLastExportStart: '2026-10-05',
  today: '2026-10-12',
  contacts: [],
  practitioners: [{ id: 3, firstname: 'Jean', lastname: 'Dupont', address: null }],
  rdvSinceLastExport: [],
  rdvRolling: [],
};

describe('buildExportZip', () => {
  it('bundles the four export files under their expected names', async () => {
    const zipEntries = unzipSync(await buildExportZip(exportData));

    expect(Object.keys(zipEntries).sort()).toEqual([
      'contacts.xlsx',
      'medecins.xlsx',
      'rdv_2026-10-05_2026-10-12.xlsx',
      'rdv_courants.xlsx',
    ]);
  });

  it('produces files that the import reads back', async () => {
    const zipEntries = unzipSync(await buildExportZip(exportData));
    const practitionersFile = new File([zipEntries['medecins.xlsx'] ?? new Uint8Array()], 'medecins.xlsx');

    const parsedFile = await parseImportFile(practitionersFile);

    expect(parsedFile).toMatchObject({
      status: 'ready',
      entity: 'practitioners',
      importData: { practitioners: exportData.practitioners },
    });
  });
});
