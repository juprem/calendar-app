import z from 'zod';
import type { general_practitioner } from '../../generated/prisma/client.ts';

export type GeneralPractitioner = general_practitioner;

export const CreateGeneralPractitionerSchema = z.object({
  firstname: z.string().optional().nullable(),
  lastname: z.string(),
  address: z.string().optional().nullable(),
});

export type CreateGeneralPractitioner = z.infer<typeof CreateGeneralPractitionerSchema>;

export function formatGeneralPractitionerName(gp: GeneralPractitioner): string {
  return gp.firstname ? `${gp.firstname} ${gp.lastname}` : gp.lastname;
}
