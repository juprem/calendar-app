import z from 'zod';

export interface GeneralPractitioner {
  readonly id: number;
  readonly firstname: string | null;
  readonly lastname: string;
  readonly address: string | null;
}

export const CreateGeneralPractitionerSchema = z.object({
  firstname: z.string().optional().nullable(),
  lastname: z.string(),
  address: z.string().optional().nullable(),
});

export type CreateGeneralPractitioner = z.infer<typeof CreateGeneralPractitionerSchema>;

export const UpdateGeneralPractitionerSchema = z.object({
  id: z.number(),
  firstname: z.string().optional().nullable(),
  lastname: z.string(),
  address: z.string().optional().nullable(),
});

export type UpdateGeneralPractitioner = z.infer<typeof UpdateGeneralPractitionerSchema>;
