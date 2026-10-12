import type { Column } from 'write-excel-file/browser';
import type {
  ContactImportRow,
  ImportEntity,
  PractitionerImportRow,
  RdvImportRow,
} from '#/domain/dataTransfer/models.ts';
import type { ISODate } from '#/utils/dateUtils.ts';

type ExcelColumnType = StringConstructor | NumberConstructor | DateConstructor | BooleanConstructor;
type CellValue = string | number | boolean | Date;

export interface ExcelColumn<Field extends string> {
  readonly field: Field;
  readonly type: ExcelColumnType;
  readonly format?: string;
  readonly ignoredOnImport?: boolean;
}

const DATE_FORMAT = 'yyyy-mm-dd';
const DATE_TIME_FORMAT = 'yyyy-mm-dd hh:mm';
const TEXT_FORMAT = '@';

const textColumn = <Field extends string>(field: Field): ExcelColumn<Field> => ({ field, type: String });
const identifierColumn = <Field extends string>(field: Field): ExcelColumn<Field> => ({
  field,
  type: Number,
});

export const PRACTITIONER_COLUMNS: readonly ExcelColumn<keyof PractitionerImportRow>[] = [
  identifierColumn('id'),
  textColumn('firstname'),
  textColumn('lastname'),
  textColumn('address'),
];

export const CONTACT_COLUMNS: readonly ExcelColumn<keyof ContactImportRow>[] = [
  identifierColumn('id'),
  textColumn('firstname'),
  textColumn('lastname'),
  textColumn('email'),
  { field: 'phoneNumber', type: String, format: TEXT_FORMAT },
  textColumn('notes'),
  { field: 'birthDate', type: Date, format: DATE_FORMAT },
  textColumn('birthLocation'),
  textColumn('address'),
  textColumn('civility'),
  identifierColumn('generalPractitionerId'),
];

export type RdvExcelField = keyof RdvImportRow | 'contactFirstname' | 'contactLastname';

export const RDV_COLUMNS: readonly ExcelColumn<RdvExcelField>[] = [
  identifierColumn('id'),
  { field: 'date', type: Date, format: DATE_FORMAT },
  { field: 'startHour', type: String, format: TEXT_FORMAT },
  { field: 'endHour', type: String, format: TEXT_FORMAT },
  textColumn('name'),
  textColumn('rdvType'),
  { field: 'isConfirmed', type: Boolean },
  textColumn('additionalInfos'),
  { field: 'confirmationDate', type: Date, format: DATE_TIME_FORMAT },
  textColumn('confirmationMode'),
  identifierColumn('contactId'),
  { ...textColumn('contactFirstname'), ignoredOnImport: true },
  { ...textColumn('contactLastname'), ignoredOnImport: true },
];

export const ENTITY_COLUMNS: Record<ImportEntity, readonly ExcelColumn<string>[]> = {
  practitioners: PRACTITIONER_COLUMNS,
  contacts: CONTACT_COLUMNS,
  rdvs: RDV_COLUMNS,
};

const ENTITIES_MOST_SPECIFIC_FIRST: readonly ImportEntity[] = ['rdvs', 'contacts', 'practitioners'];

const isCellValue = (value: unknown): value is CellValue =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  value instanceof Date;

export const buildWriteColumns = <Field extends string, Row extends Record<Field, unknown>>(
  columns: readonly ExcelColumn<Field>[],
): Column<Row>[] =>
  columns.map((column) => ({
    header: { value: column.field, fontWeight: 'bold' },
    cell: (row: Row) => {
      const rawValue = row[column.field];
      return isCellValue(rawValue)
        ? { value: rawValue, type: column.type, format: column.format }
        : { value: undefined };
    },
  }));

export const buildReadSchema = (columns: readonly ExcelColumn<string>[]) =>
  Object.fromEntries(
    columns.map((column) => [column.field, { column: column.field, type: column.type }]),
  );

export const detectEntity = (headerRow: string[]): ImportEntity | null =>
  ENTITIES_MOST_SPECIFIC_FIRST.find((entity) =>
    ENTITY_COLUMNS[entity]
      .filter((column) => !column.ignoredOnImport)
      .every((column) => headerRow.includes(column.field)),
  ) ?? null;

export const rdvSinceLastExportFileName = (sinceLastExportStart: ISODate | null, today: ISODate) =>
  `rdv_${sinceLastExportStart ?? 'debut'}_${today}.xlsx`;

export const ROLLING_RDV_FILE_NAME = 'rdv_courants.xlsx';
export const CONTACTS_FILE_NAME = 'contacts.xlsx';
export const PRACTITIONERS_FILE_NAME = 'medecins.xlsx';
export const exportZipFileName = (today: ISODate) => `export_${today}.zip`;
