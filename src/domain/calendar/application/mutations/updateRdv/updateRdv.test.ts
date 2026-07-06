import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { DbError, NotFoundError, RdvConflictError } from '#/effect/errors.ts';
import type { RdvInsertData } from '#/domain/calendar/models.ts';
import {
  mockDay,
  mockDayRepository,
  mockRdv,
  mockRdvRepository,
  runAndExpectFailure,
  testDate,
} from '#/domain/calendar/testSupport.ts';
import { updateRdv } from './updateRdv.ts';

const updateData: RdvInsertData = {
  startHour: '11:00',
  endHour: '12:00',
  name: 'Updated patient',
  rdvType: null,
  isConfirmed: null,
  contactId: null,
  additionalInfos: null,
  confirmationDate: null,
  confirmationMode: null,
};

describe('updateRdv', () => {
  it('finds or creates the day and updates the rdv with the resolved dayId', async () => {
    const updatedRdv = mockRdv({ id: 7, ...updateData });
    const update = vi.fn(() => Effect.succeed(updatedRdv));
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ update }));

    const result = await Effect.runPromise(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(result).toEqual(updatedRdv);
    expect(update).toHaveBeenCalledWith(7, { ...updateData, dayId: mockDay.id });
  });

  it('fails with a NotFoundError when the rdv does not exist', async () => {
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ findById: () => Effect.succeed(Option.none()) }));

    const error = await runAndExpectFailure(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('propagates a DbError raised while finding or creating the day', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(mockDayRepository({ findOrCreate: () => Effect.fail(dbError) }), mockRdvRepository());

    const error = await runAndExpectFailure(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('propagates a DbError raised while updating the rdv', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ update: () => Effect.fail(dbError) }));

    const error = await runAndExpectFailure(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('fails with RdvConflictError when the update overlaps another rdv on the same day, without updating', async () => {
    const conflictingRdv = mockRdv({ id: 8, startHour: '11:30', endHour: '12:30', name: 'Other patient' });
    const update = vi.fn(() => Effect.succeed(mockRdv()));
    const layer = Layer.merge(
      mockDayRepository(),
      mockRdvRepository({ findByDayId: () => Effect.succeed([conflictingRdv]), update }),
    );

    const error = await runAndExpectFailure(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(RdvConflictError);
    expect(update).not.toHaveBeenCalled();
  });

  it('does not conflict with its own previous slot on the same day', async () => {
    const updatedRdv = mockRdv({ id: 7, ...updateData });
    const ownPreviousRdv = mockRdv({ id: 7, startHour: '11:00', endHour: '12:00' });
    const update = vi.fn(() => Effect.succeed(updatedRdv));
    const layer = Layer.merge(
      mockDayRepository(),
      mockRdvRepository({ findByDayId: () => Effect.succeed([ownPreviousRdv]), update }),
    );

    const result = await Effect.runPromise(updateRdv(7, testDate, updateData).pipe(Effect.provide(layer)));

    expect(result).toEqual(updatedRdv);
  });
});
