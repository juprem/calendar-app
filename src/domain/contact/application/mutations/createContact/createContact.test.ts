import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { ContactConflictError, DbError, NotFoundError } from '#/effect/errors.ts';
import type { CreateContact } from '#/domain/contact/models.ts';
import { mockContact, mockContactRepository, runAndExpectFailure } from '#/domain/contact/testSupport.ts';
import { mockGeneralPractitioner, mockGeneralPractitionerRepository } from '#/domain/generalPractitioner/testSupport.ts';
import { createContact } from './createContact.ts';

const newContactData: CreateContact = {
  firstname: 'Marie',
  lastname: 'Curie',
};

describe('createContact', () => {
  it('saves the contact and returns it', async () => {
    const savedContact = mockContact({ id: 42, ...newContactData });
    const save = vi.fn(() => Effect.succeed(savedContact));
    const layer = Layer.merge(mockContactRepository({ save }), mockGeneralPractitionerRepository());

    const result = await Effect.runPromise(createContact(newContactData).pipe(Effect.provide(layer)));

    expect(result).toEqual(savedContact);
    expect(save).toHaveBeenCalledWith(newContactData);
  });

  it('propagates a DbError from the repository', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(
      mockContactRepository({ save: () => Effect.fail(dbError) }),
      mockGeneralPractitionerRepository(),
    );

    const error = await runAndExpectFailure(createContact(newContactData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('fails with a ContactConflictError when a contact with the same fullname already exists', async () => {
    const layer = Layer.merge(
      mockContactRepository({ findByFullName: () => Effect.succeed(Option.some(mockContact())) }),
      mockGeneralPractitionerRepository(),
    );

    const error = await runAndExpectFailure(createContact(newContactData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(ContactConflictError);
  });

  it('fails with a NotFoundError when the given general practitioner does not exist', async () => {
    const layer = Layer.merge(
      mockContactRepository(),
      mockGeneralPractitionerRepository({ findById: () => Effect.succeed(Option.none()) }),
    );

    const error = await runAndExpectFailure(
      createContact({ ...newContactData, generalPractitionerId: 99 }).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('does not check the general practitioner when none is given', async () => {
    const findById = vi.fn(() => Effect.succeed(Option.some(mockGeneralPractitioner())));
    const layer = Layer.merge(mockContactRepository(), mockGeneralPractitionerRepository({ findById }));

    await Effect.runPromise(createContact(newContactData).pipe(Effect.provide(layer)));

    expect(findById).not.toHaveBeenCalled();
  });
});
