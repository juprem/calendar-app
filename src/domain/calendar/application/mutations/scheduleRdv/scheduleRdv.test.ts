import { Effect, Layer } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { DbError, RdvConflictError } from '#/effect/errors.ts';
import type { RdvInsertData } from '#/domain/calendar/models.ts';
import {
  mockDay,
  mockDayRepository,
  mockRdv,
  mockRdvRepository,
  runAndExpectFailure,
  testDate,
} from '#/domain/calendar/testSupport.ts';
import { scheduleRdv } from './scheduleRdv.ts';

const newRdvData: RdvInsertData = {
  startHour: '09:00',
  endHour: '10:00',
  name: 'New patient',
  rdvType: null,
  isConfirmed: null,
  contactId: null,
  additionalInfos: null,
  confirmationDate: null,
  confirmationMode: null,
};

describe('scheduleRdv', () => {
  it('creates the rdv when the day has no conflicting appointment', async () => {
    const savedRdv = mockRdv({ id: 42, ...newRdvData });
    const save = vi.fn(() => Effect.succeed(savedRdv));
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ findByDayId: () => Effect.succeed([]), save }));

    const result = await Effect.runPromise(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(result).toEqual(savedRdv);
    expect(save).toHaveBeenCalledWith({ ...newRdvData, dayId: mockDay.id });
  });

  it('fails with RdvConflictError when the new rdv overlaps an existing one, without saving', async () => {
    const existingRdv = mockRdv({ startHour: '09:30', endHour: '10:30', name: 'Existing patient' });
    const save = vi.fn(() => Effect.succeed(mockRdv()));
    const layer = Layer.merge(
      mockDayRepository(),
      mockRdvRepository({ findByDayId: () => Effect.succeed([existingRdv]), save }),
    );

    const error = await runAndExpectFailure(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(error).toBeInstanceOf(RdvConflictError);
    expect(save).not.toHaveBeenCalled();
  });

  it('does not conflict with an adjacent, non-overlapping rdv', async () => {
    const adjacentRdv = mockRdv({ startHour: '10:00', endHour: '11:00' });
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ findByDayId: () => Effect.succeed([adjacentRdv]) }));

    const result = await Effect.runPromise(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(result).toBeDefined();
  });

  it('propagates a DbError raised while finding or creating the day', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(mockDayRepository({ findOrCreate: () => Effect.fail(dbError) }), mockRdvRepository());

    const error = await runAndExpectFailure(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('propagates a DbError raised while looking up same-day appointments for conflicts', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ findByDayId: () => Effect.fail(dbError) }));

    const error = await runAndExpectFailure(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });

  it('propagates a DbError raised while saving the rdv', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = Layer.merge(mockDayRepository(), mockRdvRepository({ save: () => Effect.fail(dbError) }));

    const error = await runAndExpectFailure(scheduleRdv(testDate, newRdvData).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });
});
