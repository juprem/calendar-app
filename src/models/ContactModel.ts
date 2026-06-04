import z from 'zod';
import type { contact } from '../../generated/prisma/client.ts';

export type Contact = contact;

export const CIVILITY_VALUES = ['Dr', 'Mr', 'Mme'] as const;
export type Civility = (typeof CIVILITY_VALUES)[number];

export const CIVILITY_OPTIONS = [
  { value: 'Dr' as const, label: 'Dr' },
  { value: 'Mr' as const, label: 'M.' },
  { value: 'Mme' as const, label: 'Mme' },
];

export const toValidCivility = (v: string | null): Civility | undefined => {
  if (v === 'Dr' || v === 'Mr' || v === 'Mme') return v;
  return undefined;
};

export const CreateContactSchema = z.object({
  civility: z.enum(CIVILITY_VALUES).optional(),
  firstname: z.string(),
  lastname: z.string(),
  phone_number: z.e164().optional(),
  email: z.email().optional(),
  notes: z.string().optional(),
  birth_date: z.coerce.date().optional(),
  birth_location: z.string().optional(),
  address: z.string().optional(),
});

export type CreateContact = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = z.object({
  id: z.number(),
  civility: z.enum(CIVILITY_VALUES).optional().nullable(),
  firstname: z.string(),
  lastname: z.string(),
  phone_number: z.e164().optional().nullable(),
  email: z.email().optional().nullable(),
  notes: z.string().optional().nullable(),
  birth_date: z.coerce.date().optional().nullable(),
  birth_location: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type UpdateContact = z.infer<typeof UpdateContactSchema>;
