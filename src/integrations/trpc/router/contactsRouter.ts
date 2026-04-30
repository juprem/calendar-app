import { publicProcedure } from '#/integrations/trpc/init.ts';
import { prisma } from '#/db.ts';
import { CreateContactSchema } from '#/models/ContactModel.ts';

export const contactsRouter = {
  listAll: publicProcedure.query(() => prisma.contact.findMany()),
  addContact: publicProcedure.input(CreateContactSchema).mutation( async ({ input }) =>
    prisma.contact.create({
      data: input,
    }),
  ),
};
