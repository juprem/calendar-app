import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockDay, mockDayRepository, mockRdv } from '#/domain/calendar/testSupport.ts';
import { mockContact } from '#/domain/contact/testSupport.ts';
import { mockEmailLog, mockEmailLogRepository } from '../../../testSupport.ts';
import { getReminderStatus } from './getReminderStatus.ts';

const wednesday = new Date('2026-10-14T10:00:00.000Z');

describe('getReminderStatus', () => {
  it('shows the next Monday with no run when the log is empty', async () => {
    const findWithRdvsByDate = vi.fn(() => Effect.succeed(Option.none()));
    const layer = Layer.mergeAll(mockEmailLogRepository(), mockDayRepository({ findWithRdvsByDate }));

    const status = await Effect.runPromise(getReminderStatus(wednesday).pipe(Effect.provide(layer)));

    expect(status).toEqual({ targetDate: '2026-10-19', hasRun: false, rdvWithContactCount: 0, sentCount: 0, failed: [] });
    expect(findWithRdvsByDate).toHaveBeenCalledWith(new Date('2026-10-19T00:00:00.000Z'));
  });

  it('counts the logged Monday and joins failed rows with their RDV', async () => {
    const loggedMonday = new Date('2026-10-12T00:00:00.000Z');
    const day = {
      ...mockDay,
      rdv: [
        { ...mockRdv({ id: 1, contactId: 1 }), contact: mockContact({ id: 1 }) },
        { ...mockRdv({ id: 2, contactId: 2, startHour: '14:00' }), contact: mockContact({ id: 2, firstname: 'Marie' }) },
        { ...mockRdv({ id: 3 }), contact: null },
      ],
    };
    const layer = Layer.mergeAll(
      mockEmailLogRepository({
        findLatestTargetDate: () => Effect.succeed(Option.some(loggedMonday)),
        listByTargetDate: () =>
          Effect.succeed([
            mockEmailLog({ id: 10, rdvId: 1, status: 'SENT' }),
            mockEmailLog({ id: 11, rdvId: 2, status: 'FAILED', recipient: null, error: 'Pas d’email' }),
          ]),
      }),
      mockDayRepository({ findWithRdvsByDate: () => Effect.succeed(Option.some(day)) }),
    );

    const status = await Effect.runPromise(getReminderStatus(wednesday).pipe(Effect.provide(layer)));

    expect(status).toEqual({
      targetDate: '2026-10-12',
      hasRun: true,
      rdvWithContactCount: 2,
      sentCount: 1,
      failed: [{ logId: 11, contactName: 'Marie Dupont', startHour: '14:00', recipient: null, error: 'Pas d’email' }],
    });
  });
});
