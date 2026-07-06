import z from 'zod';
// contact owns Contact; RdvWithContact composes it rather than redeclaring it — see contact/models.ts, which
// in turn composes RdvWithContact for RdvHistoryEntry. An intentional two-file cycle, types only (erased at compile time).
import type { Contact } from '#/domain/contact/models.ts';

export interface Day {
  readonly id: number;
  readonly date: Date;
}

export interface Rdv {
  readonly id: number;
  readonly dayId: number;
  readonly startHour: string;
  readonly endHour: string;
  readonly name: string;
  readonly rdvType: string | null;
  readonly isConfirmed: boolean | null;
  readonly additionalInfos: string | null;
  readonly confirmationDate: Date | null;
  readonly confirmationMode: string | null;
  readonly contactId: number | null;
}

export interface RdvWithContact extends Rdv {
  readonly contact: Contact | null;
}

export interface DayWithRdvs extends Day {
  readonly rdv: RdvWithContact[];
}

export interface RdvInsertData {
  readonly startHour: string;
  readonly endHour: string;
  readonly name: string;
  readonly rdvType: string | null;
  readonly isConfirmed: boolean | null;
  readonly contactId: number | null;
  readonly additionalInfos: string | null;
  readonly confirmationDate: Date | null;
  readonly confirmationMode: string | null;
}

export const RDV_TYPE_VALUES = [
  'Premier bilan',
  'Suivi',
  'Rééducation',
  'Bloc opératoire',
  'Urgence',
  'Privé',
] as const;

export type RdvType = (typeof RDV_TYPE_VALUES)[number];

export const CONFIRMATION_MODE_VALUES = ['email', 'direct', 'phone'] as const;

export type ConfirmationMode = (typeof CONFIRMATION_MODE_VALUES)[number];

export const RdvCreateSchema = z.object({
  date: z.string(),
  name: z.string(),
  startHour: z.string(),
  endHour: z.string(),
  rdvType: z.enum(RDV_TYPE_VALUES).optional(),
  isConfirmed: z.boolean().optional(),
  contactId: z.number().optional().nullable(),
  additionalInfos: z.string().optional().nullable(),
  confirmationDate: z.string().optional().nullable(),
  confirmationMode: z.enum(CONFIRMATION_MODE_VALUES).optional().nullable(),
});

export type CreateRdv = z.infer<typeof RdvCreateSchema>;

export const UpdateRdvSchema = z.object({
  id: z.number(),
  date: z.string(),
  name: z.string(),
  startHour: z.string(),
  endHour: z.string(),
  rdvType: z.enum(RDV_TYPE_VALUES).optional().nullable(),
  isConfirmed: z.boolean().optional().nullable(),
  contactId: z.number().optional().nullable(),
  additionalInfos: z.string().optional().nullable(),
  confirmationDate: z.string().optional().nullable(),
  confirmationMode: z.enum(CONFIRMATION_MODE_VALUES).optional().nullable(),
});

export type UpdateRdv = z.infer<typeof UpdateRdvSchema>;
