import { publicProcedure } from '#/integrations/trpc/init.ts';
import { CreateContactSchema, UpdateContactSchema } from '#/models/ContactModel.ts';
import { getAllContacts, createContact, updateContact, deleteContact, getContactRdv } from '#/server/contactsDomain.ts';
import z from 'zod';

export const contactsRouter = {
  listAll: publicProcedure.query(async () => await getAllContacts()),
  addContact: publicProcedure
    .input(CreateContactSchema)
    .mutation(({ input }) => createContact(input)),
  updateContact: publicProcedure
    .input(UpdateContactSchema)
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateContact(id, data);
    }),
  deleteContact: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteContact(input)),
  listRdvByContact: publicProcedure
    .input(z.number())
    .query(({ input }) => getContactRdv(input)),
};
