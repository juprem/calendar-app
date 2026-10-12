import z from 'zod';
import {
  ContactImportRowSchema,
  PractitionerImportRowSchema,
  RdvImportRowSchema,
  type ImportData,
  type ImportEntity,
} from '#/domain/dataTransfer/models.ts';
import { ENTITY_COLUMNS, buildReadSchema, detectEntity } from './excelColumns.ts';

export type ParsedImportFile =
  | {
      readonly status: 'ready';
      readonly fileName: string;
      readonly entity: ImportEntity;
      readonly rowCount: number;
      readonly importData: ImportData;
    }
  | { readonly status: 'error'; readonly fileName: string; readonly messages: string[] };

type RowsParseResult<Row> =
  | { readonly succeeded: true; readonly rows: Row[] }
  | { readonly succeeded: false; readonly messages: string[] };

const FIRST_DATA_ROW_NUMBER = 2;

const describeIssue = (issue: z.core.$ZodIssue) => {
  const [rowIndex, ...fieldPath] = issue.path;
  const rowNumber = typeof rowIndex === 'number' ? rowIndex + FIRST_DATA_ROW_NUMBER : '?';
  return `ligne ${rowNumber} : ${fieldPath.map(String).join('.')} — ${issue.message}`;
};

const parseRows = <Row>(schema: z.ZodType<Row>, objects: unknown): RowsParseResult<Row> => {
  const result = z.array(schema).safeParse(objects);
  return result.success
    ? { succeeded: true, rows: result.data }
    : { succeeded: false, messages: result.error.issues.map(describeIssue) };
};

const EMPTY_IMPORT_DATA: ImportData = { practitioners: [], contacts: [], rdvs: [] };

const toParsedFile = (
  fileName: string,
  entity: ImportEntity,
  objects: unknown,
): ParsedImportFile => {
  if (entity === 'practitioners') {
    const result = parseRows(PractitionerImportRowSchema, objects);
    return result.succeeded
      ? {
          status: 'ready',
          fileName,
          entity,
          rowCount: result.rows.length,
          importData: { ...EMPTY_IMPORT_DATA, practitioners: result.rows },
        }
      : { status: 'error', fileName, messages: result.messages };
  }
  if (entity === 'contacts') {
    const result = parseRows(ContactImportRowSchema, objects);
    return result.succeeded
      ? {
          status: 'ready',
          fileName,
          entity,
          rowCount: result.rows.length,
          importData: { ...EMPTY_IMPORT_DATA, contacts: result.rows },
        }
      : { status: 'error', fileName, messages: result.messages };
  }
  const result = parseRows(RdvImportRowSchema, objects);
  return result.succeeded
    ? {
        status: 'ready',
        fileName,
        entity,
        rowCount: result.rows.length,
        importData: { ...EMPTY_IMPORT_DATA, rdvs: result.rows },
      }
    : { status: 'error', fileName, messages: result.messages };
};

export async function parseImportFile(file: File): Promise<ParsedImportFile> {
  try {
    const { readSheet, parseSheetData } = await import('read-excel-file/browser');
    const sheetData = await readSheet(file);
    const headerRow = (sheetData[0] ?? []).map((cell) => (typeof cell === 'string' ? cell : ''));
    const entity = detectEntity(headerRow);
    if (entity === null) {
      return { status: 'error', fileName: file.name, messages: ['Type de fichier non reconnu'] };
    }
    const { objects, errors } = parseSheetData(sheetData, buildReadSchema(ENTITY_COLUMNS[entity]));
    if (errors) {
      return {
        status: 'error',
        fileName: file.name,
        messages: errors.map(
          (error) =>
            `ligne ${error.row + 1} : ${error.column} — ${error.error}${error.reason ? ` (${error.reason})` : ''}`,
        ),
      };
    }
    return toParsedFile(file.name, entity, objects);
  } catch {
    return { status: 'error', fileName: file.name, messages: ['Fichier illisible'] };
  }
}
