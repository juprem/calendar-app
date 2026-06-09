import { protectedProcedure } from '#/integrations/trpc/init.ts';
import { CreateContactSchema, UpdateContactSchema } from '#/models/ContactModel.ts';
import { getAllContacts, createContact, updateContact, deleteContact, getContactRdv, bulkCreateContacts } from '#/server/contactsDomain.ts';
import z from 'zod';

export const contactsRouter = {
  listAll: protectedProcedure.query(async () => await getAllContacts()),
  addContact: protectedProcedure
    .input(CreateContactSchema)
    .mutation(({ input }) => createContact(input)),
  updateContact: protectedProcedure
    .input(UpdateContactSchema)
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateContact(id, data);
    }),
  deleteContact: protectedProcedure
    .input(z.number())
    .mutation(({ input }) => deleteContact(input)),
  listRdvByContact: protectedProcedure
    .input(z.number())
    .query(({ input }) => getContactRdv(input)),
  bulkAddContacts: protectedProcedure
    .input(z.array(CreateContactSchema))
    .mutation(({ input }) => bulkCreateContacts(input)),
};
