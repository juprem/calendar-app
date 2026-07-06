import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { DbError, RdvConflictError } from '#/effect/errors.ts';
import type { RdvInsertData } from '#/domain/calendar/models.ts';
import { mockDay, mockRdv, mockRdvRepository, runAndExpectFailure } from '#/domain/calendar/testSupport.ts';
import { ensureNoRdvConflict } from './rdvConflict.ts';

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

describe('ensureNoRdvConflict', () => {
  it('succeeds when the day has no conflicting appointment', async () => {
    const layer = mockRdvRepository({ findByDayId: () => Effect.succeed([]) });

    await Effect.runPromise(ensureNoRdvConflict(mockDay.id, newRdvData).pipe(Effect.provide(layer)));
  });

  it('fails with RdvConflictError when the rdv overlaps an existing one', async () => {
    const existingRdv = mockRdv({ startHour: '09:30', endHour: '10:30', name: 'Existing patient' });
    const layer = mockRdvRepository({ findByDayId: () => Effect.succeed([existingRdv]) });

    const error = await runAndExpectFailure(
      ensureNoRdvConflict(mockDay.id, newRdvData).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(RdvConflictError);
  });

  it('does not conflict with an adjacent, non-overlapping rdv', async () => {
    const adjacentRdv = mockRdv({ startHour: '10:00', endHour: '11:00' });
    const layer = mockRdvRepository({ findByDayId: () => Effect.succeed([adjacentRdv]) });

    await Effect.runPromise(ensureNoRdvConflict(mockDay.id, newRdvData).pipe(Effect.provide(layer)));
  });

  it('ignores the excluded rdv when checking for conflicts', async () => {
    const ownRdv = mockRdv({ id: 7, startHour: '09:00', endHour: '10:00' });
    const layer = mockRdvRepository({ findByDayId: () => Effect.succeed([ownRdv]) });

    await Effect.runPromise(ensureNoRdvConflict(mockDay.id, newRdvData, 7).pipe(Effect.provide(layer)));
  });

  it('still detects a conflict with another rdv while excluding its own id', async () => {
    const ownRdv = mockRdv({ id: 7, startHour: '09:00', endHour: '10:00' });
    const otherRdv = mockRdv({ id: 8, startHour: '09:30', endHour: '10:30', name: 'Other patient' });
    const layer = mockRdvRepository({ findByDayId: () => Effect.succeed([ownRdv, otherRdv]) });

    const error = await runAndExpectFailure(
      ensureNoRdvConflict(mockDay.id, newRdvData, 7).pipe(Effect.provide(layer)),
    );

    expect(error).toBeInstanceOf(RdvConflictError);
  });

  it('propagates a DbError raised while looking up same-day appointments', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = mockRdvRepository({ findByDayId: () => Effect.fail(dbError) });

    const error = await runAndExpectFailure(
      ensureNoRdvConflict(mockDay.id, newRdvData).pipe(Effect.provide(layer)),
    );

    expect(error).toBe(dbError);
  });
});
