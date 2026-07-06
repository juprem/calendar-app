import z from 'zod';
// calendar owns Rdv/RdvWithContact; RdvHistoryEntry composes it rather than redeclaring Rdv's fields — see
// calendar/models.ts, which in turn composes Contact for RdvWithContact. An intentional two-file cycle, types only.
import type { RdvWithContact } from '#/domain/calendar/models.ts';

export const CIVILITY_VALUES = ['Dr', 'Mr', 'Mme'] as const;
export type Civility = (typeof CIVILITY_VALUES)[number];

export interface Contact {
  readonly id: number;
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly notes: string | null;
  readonly birthDate: Date;
  readonly birthLocation: string | null;
  readonly address: string | null;
  readonly civility: string | null;
  readonly generalPractitionerId: number | null;
}

export const CreateContactSchema = z.object({
  civility: z.enum(CIVILITY_VALUES).optional(),
  firstname: z.string(),
  lastname: z.string(),
  phoneNumber: z.e164().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  birthLocation: z.string().optional(),
  address: z.string().optional(),
  generalPractitionerId: z.number().optional().nullable(),
});

export type CreateContact = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = z.object({
  id: z.number(),
  civility: z.enum(CIVILITY_VALUES).optional().nullable(),
  firstname: z.string(),
  lastname: z.string(),
  phoneNumber: z.e164().optional().nullable(),
  email: z.email().optional().nullable(),
  notes: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional(),
  birthLocation: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  generalPractitionerId: z.number().optional().nullable(),
});

export type UpdateContact = z.infer<typeof UpdateContactSchema>;

export type RdvHistoryEntry = RdvWithContact & {
  readonly day: { readonly date: Date };
};

export interface BulkCreateResult {
  readonly count: number;
}
