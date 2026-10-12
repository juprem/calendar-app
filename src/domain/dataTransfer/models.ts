import z from 'zod';
import type { Rdv } from '#/domain/calendar/models.ts';
import type { Contact } from '#/domain/contact/models.ts';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import type { ISODate } from '#/utils/dateUtils.ts';

export interface ExportLog {
  readonly id: number;
  readonly exportedAt: Date;
}

export interface RdvExportRow extends Rdv {
  readonly date: Date;
  readonly contactFirstname: string | null;
  readonly contactLastname: string | null;
}

export interface ExportData {
  readonly exportedAt: Date;
  readonly sinceLastExportStart: ISODate | null;
  readonly today: ISODate;
  readonly contacts: Contact[];
  readonly practitioners: GeneralPractitioner[];
  readonly rdvSinceLastExport: RdvExportRow[];
  readonly rdvRolling: RdvExportRow[];
}

export const RecordExportSchema = z.object({ exportedAt: z.date() });

const ImportIdSchema = z.number().int().positive();
const NullableTextSchema = z.string().nullable();

export const PractitionerImportRowSchema = z.object({
  id: ImportIdSchema,
  firstname: NullableTextSchema,
  lastname: z.string(),
  address: NullableTextSchema,
});

export const ContactImportRowSchema = z.object({
  id: ImportIdSchema,
  firstname: z.string(),
  lastname: z.string(),
  email: NullableTextSchema,
  phoneNumber: NullableTextSchema,
  notes: NullableTextSchema,
  birthDate: z.date(),
  birthLocation: NullableTextSchema,
  address: NullableTextSchema,
  civility: NullableTextSchema,
  generalPractitionerId: ImportIdSchema.nullable(),
});

export const RdvImportRowSchema = z.object({
  id: ImportIdSchema,
  date: z.date(),
  startHour: z.string(),
  endHour: z.string(),
  name: z.string(),
  rdvType: NullableTextSchema,
  isConfirmed: z.boolean().nullable(),
  additionalInfos: NullableTextSchema,
  confirmationDate: z.date().nullable(),
  confirmationMode: NullableTextSchema,
  contactId: ImportIdSchema.nullable(),
});

export const ImportDataSchema = z.object({
  practitioners: z.array(PractitionerImportRowSchema),
  contacts: z.array(ContactImportRowSchema),
  rdvs: z.array(RdvImportRowSchema),
});

export type PractitionerImportRow = z.infer<typeof PractitionerImportRowSchema>;
export type ContactImportRow = z.infer<typeof ContactImportRowSchema>;
export type RdvImportRow = z.infer<typeof RdvImportRowSchema>;
export type ImportData = z.infer<typeof ImportDataSchema>;

export const IMPORT_ENTITIES = ['practitioners', 'contacts', 'rdvs'] as const;
export type ImportEntity = (typeof IMPORT_ENTITIES)[number];

export interface ImportRowError {
  readonly entity: ImportEntity;
  readonly rowNumber: number;
  readonly reason: string;
}

export interface ImportCount {
  readonly created: number;
  readonly updated: number;
}

export type ImportResult =
  | { readonly status: 'imported'; readonly counts: Record<ImportEntity, ImportCount> }
  | { readonly status: 'rejected'; readonly errors: ImportRowError[] };
