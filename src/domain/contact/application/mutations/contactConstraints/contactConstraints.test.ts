import { Effect, Option } from 'effect';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactBirthDateRequiredError, ContactConflictError, NotFoundError } from '#/effect/errors.ts';
import { mockContact, mockContactRepository, runAndExpectFailure } from '#/domain/contact/testSupport.ts';
import { mockGeneralPractitioner, mockGeneralPractitionerRepository } from '#/domain/generalPractitioner/testSupport.ts';
import { ensureGeneralPractitionerExists, ensureIdentityIsAvailable, resolveBirthDate } from './contactConstraints.ts';

const birthDate = new Date('1867-11-07T00:00:00.000Z');

describe('resolveBirthDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the given birth date without querying homonyms', async () => {
    const findByName = vi.fn(() => Effect.succeed([mockContact({ id: 2 })]));
    const layer = mockContactRepository({ findByName });

    const result = await Effect.runPromise(
      resolveBirthDate('Marie', 'Curie', birthDate).pipe(Effect.provide(layer)),
    );

    expect(result).toEqual(birthDate);
    expect(findByName).not.toHaveBeenCalled();
  });

  it('fails with a ContactBirthDateRequiredError when the birth date is missing and a homonym exists', async () => {
    const layer = mockContactRepository({ findByName: () => Effect.succeed([mockContact({ id: 2 })]) });

    const error = await runAndExpectFailure(
      resolveBirthDate('Marie', 'Curie', undefined, 1).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(ContactBirthDateRequiredError);
  });

  it('defaults to today at UTC midnight when the only homonym is the excluded contact', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T14:30:00.000Z'));
    const layer = mockContactRepository({ findByName: () => Effect.succeed([mockContact({ id: 1 })]) });

    const result = await Effect.runPromise(
      resolveBirthDate('Marie', 'Curie', undefined, 1).pipe(Effect.provide(layer)),
    );

    expect(result).toEqual(new Date('2026-10-07T00:00:00.000Z'));
  });
});

describe('ensureIdentityIsAvailable', () => {
  it('succeeds when no contact has that identity', async () => {
    const layer = mockContactRepository({ findByIdentity: () => Effect.succeed(Option.none()) });

    await Effect.runPromise(ensureIdentityIsAvailable('Marie', 'Curie', birthDate).pipe(Effect.provide(layer)));
  });

  it('fails with a ContactConflictError when another contact already has that identity', async () => {
    const layer = mockContactRepository({
      findByIdentity: () => Effect.succeed(Option.some(mockContact({ id: 2 }))),
    });

    const error = await runAndExpectFailure(
      ensureIdentityIsAvailable('Marie', 'Curie', birthDate, 1).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(ContactConflictError);
  });

  it('succeeds when the matching contact is the excluded one', async () => {
    const layer = mockContactRepository({
      findByIdentity: () => Effect.succeed(Option.some(mockContact({ id: 1 }))),
    });

    await Effect.runPromise(ensureIdentityIsAvailable('Marie', 'Curie', birthDate, 1).pipe(Effect.provide(layer)));
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
