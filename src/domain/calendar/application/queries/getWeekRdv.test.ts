import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { DbError } from '#/effect/errors.ts';
import type { DayWithRdvs } from '#/domain/calendar/models.ts';
import { mockDayRepository, runAndExpectFailure } from '#/domain/calendar/testSupport.ts';
import { getWeekRdv } from './getWeekRdv.ts';

describe('getWeekRdv', () => {
  it('queries the 7-day range starting at the given date and returns the days', async () => {
    const days: DayWithRdvs[] = [{ id: 1, date: new Date('2026-01-05T00:00:00.000Z'), rdv: [] }];
    const findManyWithRdvsInRange = vi.fn(() => Effect.succeed(days));
    const layer = mockDayRepository({ findManyWithRdvsInRange });

    const result = await Effect.runPromise(getWeekRdv(5, 1, 2026).pipe(Effect.provide(layer)));

    expect(result).toEqual(days);
    expect(findManyWithRdvsInRange).toHaveBeenCalledWith(
      new Date('2026-01-05T00:00:00.000Z'),
      new Date('2026-01-12T00:00:00.000Z'),
    );
  });

  it('handles a range that crosses a month and year boundary', async () => {
    const findManyWithRdvsInRange = vi.fn(() => Effect.succeed([]));
    const layer = mockDayRepository({ findManyWithRdvsInRange });

    await Effect.runPromise(getWeekRdv(28, 12, 2025).pipe(Effect.provide(layer)));

    expect(findManyWithRdvsInRange).toHaveBeenCalledWith(
      new Date('2025-12-28T00:00:00.000Z'),
      new Date('2026-01-04T00:00:00.000Z'),
    );
  });

  it('propagates a DbError from the repository', async () => {
    const dbError = new DbError({ message: 'boom', cause: undefined });
    const layer = mockDayRepository({ findManyWithRdvsInRange: () => Effect.fail(dbError) });

    const error = await runAndExpectFailure(getWeekRdv(5, 1, 2026).pipe(Effect.provide(layer)));

    expect(error).toBe(dbError);
  });
});
