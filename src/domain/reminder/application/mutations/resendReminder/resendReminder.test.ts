import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockDay, mockDayRepository, mockRdv } from '#/domain/calendar/testSupport.ts';
import { mockContact } from '#/domain/contact/testSupport.ts';
import { NotFoundError } from '#/effect/errors.ts';
import { mockEmailLog, mockEmailLogRepository, mockEmailSender, runAndExpectFailure } from '../../../testSupport.ts';
import { resendReminder } from './resendReminder.ts';

const now = new Date('2026-10-11T15:00:00.000Z');
const failedLog = mockEmailLog({ id: 7, rdvId: 3, status: 'FAILED', error: 'Invalid email' });
const dayWithRdv = { ...mockDay, rdv: [{ ...mockRdv({ id: 3, contactId: 1 }), contact: mockContact({ email: 'a@example.com' }) }] };

describe('resendReminder', () => {
  it('resends the RDV of the log and records the new result on the same Monday', async () => {
    const record = vi.fn((emailLog) => Effect.succeed(mockEmailLog({ ...emailLog, id: 7 })));
    const findWithRdvsByDate = vi.fn(() => Effect.succeed(Option.some(dayWithRdv)));
    const layer = Layer.mergeAll(
      mockEmailLogRepository({ findById: () => Effect.succeed(Option.some(failedLog)), record }),
      mockDayRepository({ findWithRdvsByDate }),
      mockEmailSender(),
    );

    const result = await Effect.runPromise(resendReminder(7, now).pipe(Effect.provide(layer)));

    expect(findWithRdvsByDate).toHaveBeenCalledWith(failedLog.targetDate);
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ rdvId: 3, targetDate: failedLog.targetDate, status: 'SENT', sentAt: now }),
    );
    expect(result.status).toBe('SENT');
  });

  it('fails with NotFoundError when the log does not exist', async () => {
    const layer = Layer.mergeAll(
      mockEmailLogRepository({ findById: () => Effect.succeed(Option.none()) }),
      mockDayRepository(),
      mockEmailSender(),
    );

    expect(await runAndExpectFailure(resendReminder(7, now).pipe(Effect.provide(layer)))).toBeInstanceOf(NotFoundError);
  });

  it('fails with NotFoundError when the RDV left that Monday', async () => {
    const layer = Layer.mergeAll(
      mockEmailLogRepository({ findById: () => Effect.succeed(Option.some(failedLog)) }),
      mockDayRepository({ findWithRdvsByDate: () => Effect.succeed(Option.some({ ...mockDay, rdv: [] })) }),
      mockEmailSender(),
    );

    expect(await runAndExpectFailure(resendReminder(7, now).pipe(Effect.provide(layer)))).toBeInstanceOf(NotFoundError);
  });
});
