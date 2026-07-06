import { Effect, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { DbError, NotFoundError } from '#/effect/errors.ts';
import type { UpdateGeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import {
  mockGeneralPractitioner,
  mockGeneralPractitionerRepository,
  runAndExpectFailure,
} from '#/domain/generalPractitioner/testSupport.ts';
import { updateGeneralPractitioner } from './updateGeneralPractitioner.ts';

const updateData: Omit<UpdateGeneralPractitioner, 'id'> = {
  firstname: 'Marie',
  lastname: 'Curie-Updated',
  address: '1 rue de la Paix',
};

describe('updateGeneralPractitioner', () => {
  it('updates the practitioner and returns it', async () => {
    const updatedPractitioner = mockGeneralPractitioner({ id: 7, ...updateData });
    const update = vi.fn(() => Effect.succeed(updatedPractitioner));
    const layer = mockGeneralPractitionerRepository({ update });

    const result = await Effect.runPromise(updateGeneralPractitioner(7, updateData).pipe(Effect.provide(layer)));

    expect(result).toEqual(updatedPractitioner);
    expect(update).toHaveBeenCalledWith(7, updateData);
  });

  it('fails with a NotFoundError when the practitioner does not exist', async () => {
    const layer = mockGeneralPractitionerRepository({ findById: () => Effect.succeed(Option.none()) });

    const error = await runAndExpectFailure(updateGeneralPractitioner(7, updateData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('propagates a DbError from the repository', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = mockGeneralPractitionerRepository({ update: () => Effect.fail(dbError) });

    const error = await runAndExpectFailure(updateGeneralPractitioner(7, updateData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });
});
