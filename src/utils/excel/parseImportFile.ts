import z from 'zod';
import {
  ContactImportRowSchema,
  PractitionerImportRowSchema,
  RdvImportRowSchema,
  toExcelRowNumber,
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
      readonly importData: Partial<ImportData>;
    }
  | { readonly status: 'error'; readonly fileName: string; readonly messages: string[] };

type RowsParseResult =
  | { readonly succeeded: true; readonly rowCount: number; readonly importData: Partial<ImportData> }
  | { readonly succeeded: false; readonly messages: string[] };

const describeIssue = (issue: z.core.$ZodIssue) => {
  const [rowIndex, ...fieldPath] = issue.path;
  const rowNumber = typeof rowIndex === 'number' ? toExcelRowNumber(rowIndex) : '?';
  return `ligne ${rowNumber} : ${fieldPath.map(String).join('.')} — ${issue.message}`;
};

const parseRows = <Row>(
  rowSchema: z.ZodType<Row>,
  objects: unknown,
  toImportData: (rows: Row[]) => Partial<ImportData>,
): RowsParseResult => {
  const result = z.array(rowSchema).safeParse(objects);
  return result.success
    ? { succeeded: true, rowCount: result.data.length, importData: toImportData(result.data) }
    : { succeeded: false, messages: result.error.issues.map(describeIssue) };
};

const ROW_PARSERS: Record<ImportEntity, (objects: unknown) => RowsParseResult> = {
  practitioners: (objects) => parseRows(PractitionerImportRowSchema, objects, (rows) => ({ practitioners: rows })),
  contacts: (objects) => parseRows(ContactImportRowSchema, objects, (rows) => ({ contacts: rows })),
  rdvs: (objects) => parseRows(RdvImportRowSchema, objects, (rows) => ({ rdvs: rows })),
};

const toParsedFile = (fileName: string, entity: ImportEntity, objects: unknown): ParsedImportFile => {
  const result = ROW_PARSERS[entity](objects);
  return result.succeeded
    ? { status: 'ready', fileName, entity, rowCount: result.rowCount, importData: result.importData }
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
            `ligne ${toExcelRowNumber(error.row - 1)} : ${error.column} — ${error.error}${error.reason ? ` (${error.reason})` : ''}`,
        ),
      };
    }
    return toParsedFile(file.name, entity, objects);
  } catch {
    return { status: 'error', fileName: file.name, messages: ['Fichier illisible'] };
  }
}
