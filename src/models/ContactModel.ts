import z from 'zod';

export const CreateContactSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  phone_number: z.e164().optional(),
  email: z.email().optional(),
  notes: z.string().optional(),
});

export type CreateContact = z.infer<typeof CreateContactSchema>;
