import { Effect, Option } from 'effect';
import { describe, expect, it } from 'vitest';
import { DbError } from '#/effect/errors.ts';
import type { DayWithRdvs } from '#/domain/calendar/models.ts';
import { mockDayRepository, runAndExpectFailure, testDate } from '#/domain/calendar/testSupport.ts';
import { getDayRdv } from './getDayRdv.ts';

describe('getDayRdv', () => {
  it('returns the day with its rdvs when one exists', async () => {
    const dayWithRdvs: DayWithRdvs = { id: 1, date: testDate, rdv: [] };
    const layer = mockDayRepository({ findWithRdvsByDate: () => Effect.succeed(Option.some(dayWithRdvs)) });

    const result = await Effect.runPromise(getDayRdv(testDate).pipe(Effect.provide(layer)));

    expect(result).toEqual(dayWithRdvs);
  });

  it('returns null when no day exists for the date', async () => {
    const layer = mockDayRepository({ findWithRdvsByDate: () => Effect.succeed(Option.none()) });

    const result = await Effect.runPromise(getDayRdv(testDate).pipe(Effect.provide(layer)));

    expect(result).toBeNull();
  });

  it('propagates a DbError from the repository', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = mockDayRepository({ findWithRdvsByDate: () => Effect.fail(dbError) });

    const error = await runAndExpectFailure(getDayRdv(testDate).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });
});
