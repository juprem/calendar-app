import z from 'zod';

export const CreateContactSchema = z.object({
  civility: z.enum(['Dr', 'Mr', 'Mme']).optional(),
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
