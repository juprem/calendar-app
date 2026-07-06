import { Effect } from 'effect';
import { protectedProcedure } from '#/configurations/trpc/init.ts';
import { CreateContactSchema, UpdateContactSchema } from '#/domain/contact/models.ts';
import z from 'zod';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { createContact } from '#/domain/contact/application/mutations/createContact/createContact.ts';
import { updateContact } from '#/domain/contact/application/mutations/updateContact/updateContact.ts';
import { ContactConflictError, NotFoundError } from '#/effect/errors.ts';
import { catchDomainErrors } from '#/effect/toTRPCError/toTRPCError.ts';
import { runContactEffect } from '#/domain/contact/application/controllers/runtime.ts';

const catchContactErrors = catchDomainErrors([
  [(cause): cause is ContactConflictError => cause instanceof ContactConflictError, 'CONFLICT'],
  [(cause): cause is NotFoundError => cause instanceof NotFoundError, 'NOT_FOUND'],
]);

const contactProcedure = protectedProcedure.use(catchContactErrors);

export const contactsRouter = {
  listAll: contactProcedure.query(() =>
    runContactEffect(
      Effect.gen(function* () {
        const contactRepository = yield* ContactRepository;
        return yield* contactRepository.findAll();
      }),
    ),
  ),
  addContact: contactProcedure.input(CreateContactSchema).mutation(({ input }) => runContactEffect(createContact(input))),
  updateContact: contactProcedure.input(UpdateContactSchema).mutation(({ input }) => {
    const { id, ...data } = input;
    return runContactEffect(updateContact(id, data));
  }),
  deleteContact: contactProcedure.input(z.number()).mutation(({ input }) =>
    runContactEffect(
      Effect.gen(function* () {
        const contactRepository = yield* ContactRepository;
        return yield* contactRepository.delete(input);
      }),
    ),
  ),
  listRdvByContact: contactProcedure.input(z.number()).query(({ input }) =>
    runContactEffect(
      Effect.gen(function* () {
        const contactRepository = yield* ContactRepository;
        return yield* contactRepository.findAppointmentHistory(input);
      }),
    ),
  ),
  bulkAddContacts: contactProcedure.input(z.array(CreateContactSchema)).mutation(({ input }) =>
    runContactEffect(
      Effect.gen(function* () {
        const contactRepository = yield* ContactRepository;
        return yield* contactRepository.bulkSave(input);
      }),
    ),
  ),
};
