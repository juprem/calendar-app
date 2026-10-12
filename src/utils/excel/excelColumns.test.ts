import { describe, expect, it } from 'vitest';
import {
  ContactImportRowSchema,
  PractitionerImportRowSchema,
  RdvImportRowSchema,
} from '#/domain/dataTransfer/models.ts';
import {
  CONTACT_COLUMNS,
  PRACTITIONER_COLUMNS,
  RDV_COLUMNS,
  detectEntity,
  rdvSinceLastExportFileName,
  type ExcelColumn,
} from './excelColumns.ts';

const importedFields = (columns: readonly ExcelColumn<string>[]) =>
  columns
    .filter((column) => !column.ignoredOnImport)
    .map((column) => column.field)
    .sort();

const headersOf = (columns: readonly ExcelColumn<string>[]) => columns.map((column) => column.field);

describe('detectEntity', () => {
  it('detects practitioners', () => {
    expect(detectEntity(headersOf(PRACTITIONER_COLUMNS))).toBe('practitioners');
  });

  it('detects contacts even though practitioner headers are a subset', () => {
    expect(detectEntity(headersOf(CONTACT_COLUMNS))).toBe('contacts');
  });

  it('detects rdvs with or without the readable contact name columns', () => {
    expect(detectEntity(headersOf(RDV_COLUMNS))).toBe('rdvs');
    expect(detectEntity(importedFields(RDV_COLUMNS))).toBe('rdvs');
  });

  it('returns null for unknown headers', () => {
    expect(detectEntity(['foo', 'bar'])).toBeNull();
    expect(detectEntity([])).toBeNull();
  });
});

describe('column lists', () => {
  it('cover every key of their import row schema', () => {
    expect(importedFields(PRACTITIONER_COLUMNS)).toEqual(
      Object.keys(PractitionerImportRowSchema.shape).sort(),
    );
    expect(importedFields(CONTACT_COLUMNS)).toEqual(Object.keys(ContactImportRowSchema.shape).sort());
    expect(importedFields(RDV_COLUMNS)).toEqual(Object.keys(RdvImportRowSchema.shape).sort());
  });
});

describe('rdvSinceLastExportFileName', () => {
  it('falls back to debut on first export', () => {
    expect(rdvSinceLastExportFileName(null, '2026-10-12')).toBe('rdv_debut_2026-10-12.xlsx');
    expect(rdvSinceLastExportFileName('2026-09-01', '2026-10-12')).toBe(
      'rdv_2026-09-01_2026-10-12.xlsx',
    );
  });
});
