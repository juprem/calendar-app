import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { ContactConflictError, DbError, NotFoundError } from '#/effect/errors.ts';
import type { UpdateContact } from '#/domain/contact/models.ts';
import { mockContact, mockContactRepository, runAndExpectFailure } from '#/domain/contact/testSupport.ts';
import { mockGeneralPractitionerRepository } from '#/domain/generalPractitioner/testSupport.ts';
import { updateContact } from './updateContact.ts';

const updateData: Omit<UpdateContact, 'id'> = {
  firstname: 'Marie',
  lastname: 'Curie-Updated',
};

describe('updateContact', () => {
  it('updates the contact and returns it', async () => {
    const updatedContact = mockContact({ id: 7, ...updateData });
    const update = vi.fn(() => Effect.succeed(updatedContact));
    const layer = Layer.merge(mockContactRepository({ update }), mockGeneralPractitionerRepository());

    const result = await Effect.runPromise(updateContact(7, updateData).pipe(Effect.provide(layer)));

    expect(result).toEqual(updatedContact);
    expect(update).toHaveBeenCalledWith(7, updateData);
  });

  it('fails with a NotFoundError when the contact does not exist', async () => {
    const layer = Layer.merge(
      mockContactRepository({ findById: () => Effect.succeed(Option.none()) }),
      mockGeneralPractitionerRepository(),
    );

    const error = await runAndExpectFailure(updateContact(7, updateData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('propagates a DbError from the repository', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(
      mockContactRepository({ update: () => Effect.fail(dbError) }),
      mockGeneralPractitionerRepository(),
    );

    const error = await runAndExpectFailure(updateContact(7, updateData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('fails with a ContactConflictError when another contact already has the same fullname', async () => {
    const layer = Layer.merge(
      mockContactRepository({
        findByFullName: () => Effect.succeed(Option.some(mockContact({ id: 99 }))),
      }),
      mockGeneralPractitionerRepository(),
    );

    const error = await runAndExpectFailure(updateContact(7, updateData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(ContactConflictError);
  });

  it('allows keeping its own fullname unchanged', async () => {
    const updatedContact = mockContact({ id: 7, ...updateData });
    const layer = Layer.merge(
      mockContactRepository({
        findByFullName: () => Effect.succeed(Option.some(mockContact({ id: 7 }))),
        update: () => Effect.succeed(updatedContact),
      }),
      mockGeneralPractitionerRepository(),
    );

    const result = await Effect.runPromise(updateContact(7, updateData).pipe(Effect.provide(layer)));

    expect(result).toEqual(updatedContact);
  });

  it('fails with a NotFoundError when the given general practitioner does not exist', async () => {
    const layer = Layer.merge(
      mockContactRepository(),
      mockGeneralPractitionerRepository({ findById: () => Effect.succeed(Option.none()) }),
    );

    const error = await runAndExpectFailure(
      updateContact(7, { ...updateData, generalPractitionerId: 99 }).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(NotFoundError);
  });
});
