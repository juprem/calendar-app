import { describe, expect, it } from 'vitest';
import writeExcelFile from 'write-excel-file/node';
import type { ContactImportRow, RdvImportRow } from '#/domain/dataTransfer/models.ts';
import type { RdvExportRow } from '#/domain/dataTransfer/models.ts';
import { CONTACT_COLUMNS, RDV_COLUMNS, buildWriteColumns, type ExcelColumn } from './excelColumns.ts';
import { parseImportFile } from './parseImportFile.ts';

const toXlsxFile = async <Field extends string, Row extends Record<Field, unknown>>(
  rows: Row[],
  columns: readonly ExcelColumn<Field>[],
  fileName: string,
) => {
  const buffer = await writeExcelFile(rows, { columns: buildWriteColumns<Field, Row>(columns) }).toBuffer();
  return new File([new Uint8Array(buffer)], fileName);
};

const contactRow: ContactImportRow = {
  id: 7,
  firstname: 'Marie',
  lastname: 'Curie',
  email: null,
  phoneNumber: '0612345678',
  notes: null,
  birthDate: new Date('1990-05-14T00:00:00.000Z'),
  birthLocation: 'Paris',
  address: null,
  civility: 'Mme',
  generalPractitionerId: 3,
};

const rdvRow: RdvExportRow = {
  id: 42,
  dayId: 9,
  date: new Date('2026-10-12T00:00:00.000Z'),
  startHour: '09:00',
  endHour: '09:30',
  name: 'Bilan',
  rdvType: 'Suivi',
  isConfirmed: true,
  additionalInfos: null,
  confirmationDate: null,
  confirmationMode: null,
  contactId: 7,
  contactFirstname: 'Marie',
  contactLastname: 'Curie',
};

describe('parseImportFile', () => {
  it('reads back an exported contacts file with the same values', async () => {
    const file = await toXlsxFile([contactRow], CONTACT_COLUMNS, 'contacts.xlsx');

    const parsedFile = await parseImportFile(file);

    expect(parsedFile).toEqual({
      status: 'ready',
      fileName: 'contacts.xlsx',
      entity: 'contacts',
      rowCount: 1,
      importData: { contacts: [contactRow] },
    });
  });

  it('reads back an exported RDV file and drops the contact name columns', async () => {
    const file = await toXlsxFile([rdvRow], RDV_COLUMNS, 'rdv_courants.xlsx');

    const parsedFile = await parseImportFile(file);

    const expectedRdv: RdvImportRow = {
      id: 42,
      date: rdvRow.date,
      startHour: '09:00',
      endHour: '09:30',
      name: 'Bilan',
      rdvType: 'Suivi',
      isConfirmed: true,
      additionalInfos: null,
      confirmationDate: null,
      confirmationMode: null,
      contactId: 7,
    };
    expect(parsedFile).toMatchObject({ status: 'ready', entity: 'rdvs', importData: { rdvs: [expectedRdv] } });
  });

  it('reports the Excel row number of an invalid row', async () => {
    const file = await toXlsxFile(
      [contactRow, { ...contactRow, id: 8, lastname: null }],
      CONTACT_COLUMNS,
      'contacts.xlsx',
    );

    const parsedFile = await parseImportFile(file);

    expect(parsedFile.status).toBe('error');
    expect(parsedFile.status === 'error' && parsedFile.messages).toEqual([
      expect.stringMatching(/^ligne 3 : lastname/),
    ]);
  });

  it('rejects a file whose columns match no entity', async () => {
    const file = await toXlsxFile([{ title: 'x' }], [{ field: 'title', type: String }], 'notes.xlsx');

    const parsedFile = await parseImportFile(file);

    expect(parsedFile).toEqual({ status: 'error', fileName: 'notes.xlsx', messages: ['Type de fichier non reconnu'] });
  });
});
