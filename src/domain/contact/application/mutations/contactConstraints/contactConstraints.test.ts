import { Effect, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { ContactConflictError, NotFoundError } from '#/effect/errors.ts';
import { mockContact, mockContactRepository, runAndExpectFailure } from '#/domain/contact/testSupport.ts';
import { mockGeneralPractitioner, mockGeneralPractitionerRepository } from '#/domain/generalPractitioner/testSupport.ts';
import { ensureFullNameIsAvailable, ensureGeneralPractitionerExists } from './contactConstraints.ts';

describe('ensureFullNameIsAvailable', () => {
  it('succeeds when no contact has that fullname', async () => {
    const layer = mockContactRepository({ findByFullName: () => Effect.succeed(Option.none()) });

    await Effect.runPromise(ensureFullNameIsAvailable('Marie', 'Curie').pipe(Effect.provide(layer)));
  });

  it('fails with a ContactConflictError when another contact already has that fullname', async () => {
    const layer = mockContactRepository({
      findByFullName: () => Effect.succeed(Option.some(mockContact({ id: 2 }))),
    });

    const error = await runAndExpectFailure(
      ensureFullNameIsAvailable('Marie', 'Curie', 1).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(ContactConflictError);
  });

  it('succeeds when the matching contact is the excluded one', async () => {
    const layer = mockContactRepository({
      findByFullName: () => Effect.succeed(Option.some(mockContact({ id: 1 }))),
    });

    await Effect.runPromise(ensureFullNameIsAvailable('Marie', 'Curie', 1).pipe(Effect.provide(layer)));
  });
});

describe('ensureGeneralPractitionerExists', () => {
  it('succeeds without checking the repository when no id is given', async () => {
    const findById = vi.fn(() => Effect.succeed(Option.some(mockGeneralPractitioner())));
    const layer = mockGeneralPractitionerRepository({ findById });

    await Effect.runPromise(ensureGeneralPractitionerExists(null).pipe(Effect.provide(layer)));
    await Effect.runPromise(ensureGeneralPractitionerExists(undefined).pipe(Effect.provide(layer)));

    expect(findById).not.toHaveBeenCalled();
  });

  it('succeeds when the general practitioner exists', async () => {
    const layer = mockGeneralPractitionerRepository({
      findById: () => Effect.succeed(Option.some(mockGeneralPractitioner())),
    });

    await Effect.runPromise(ensureGeneralPractitionerExists(1).pipe(Effect.provide(layer)));
  });

  it('fails with a NotFoundError when the general practitioner does not exist', async () => {
    const layer = mockGeneralPractitionerRepository({ findById: () => Effect.succeed(Option.none()) });

    const error = await runAndExpectFailure(ensureGeneralPractitionerExists(1).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(NotFoundError);
  });
});
