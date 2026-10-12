import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockDay, mockDayRepository, mockRdv } from '#/domain/calendar/testSupport.ts';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { mockContact } from '#/domain/contact/testSupport.ts';
import { EmailSendError } from '#/effect/errors.ts';
import { MISSING_EMAIL_ERROR, type EmailLog, type ReminderEmail } from '../../../models.ts';
import { mockEmailLog, mockEmailLogRepository, mockEmailSender } from '../../../testSupport.ts';
import { sendMondayReminders } from './sendMondayReminders.ts';

const sundayNoon = new Date('2026-10-11T10:00:00.000Z');
const monday = new Date('2026-10-12T00:00:00.000Z');

const rdvWithContact = (id: number, email: string | null): RdvWithContact => ({
  ...mockRdv({ id, contactId: id }),
  contact: mockContact({ id, email }),
});

type SendEmail = (email: ReminderEmail) => Effect.Effect<void, EmailSendError>;

const runWith = (rdvs: RdvWithContact[], overrides: { send?: SendEmail; existingLogs?: EmailLog[] } = {}) => {
  const record = vi.fn((emailLog: Omit<EmailLog, 'id'>) => Effect.succeed(mockEmailLog(emailLog)));
  const send = vi.fn(overrides.send ?? (() => Effect.void));
  const findWithRdvsByDate = vi.fn(() => Effect.succeed(Option.some({ ...mockDay, rdv: rdvs })));
  const layer = Layer.mergeAll(
    mockDayRepository({ findWithRdvsByDate }),
    mockEmailLogRepository({ record, listByTargetDate: () => Effect.succeed(overrides.existingLogs ?? []) }),
    mockEmailSender({ send }),
  );
  return {
    record,
    send,
    findWithRdvsByDate,
    result: Effect.runPromise(sendMondayReminders(sundayNoon).pipe(Effect.provide(layer))),
  };
};

describe('sendMondayReminders', () => {
  it('targets the next Monday', async () => {
    const { findWithRdvsByDate, result } = runWith([]);
    await result;
    expect(findWithRdvsByDate).toHaveBeenCalledWith(monday);
  });

  it('ignores RDV without contact', async () => {
    const { send, record, result } = runWith([{ ...mockRdv({ id: 9 }), contact: null }]);
    expect(await result).toEqual([]);
    expect(send).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  it('logs a failure without calling Brevo when the contact has no email', async () => {
    const { send, record, result } = runWith([rdvWithContact(1, null)]);
    await result;
    expect(send).not.toHaveBeenCalled();
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ rdvId: 1, status: 'FAILED', error: MISSING_EMAIL_ERROR, recipient: null }),
    );
  });

  it('logs the Brevo error and keeps processing the other RDV', async () => {
    const send: SendEmail = (email) =>
      email.to.email === 'a@example.com' ? Effect.fail(new EmailSendError({ message: 'Invalid email' })) : Effect.void;
    const { record, result } = runWith([rdvWithContact(1, 'a@example.com'), rdvWithContact(2, 'b@example.com')], {
      send,
    });
    await result;
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ rdvId: 1, status: 'FAILED', error: 'Invalid email' }));
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ rdvId: 2, status: 'SENT', error: null }));
  });

  it('skips RDV already sent for that Monday but retries failed ones', async () => {
    const { send, result } = runWith([rdvWithContact(1, 'a@example.com'), rdvWithContact(2, 'b@example.com')], {
      existingLogs: [mockEmailLog({ rdvId: 1, status: 'SENT' }), mockEmailLog({ rdvId: 2, status: 'FAILED' })],
    });
    await result;
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: { email: 'b@example.com', name: 'Jean Dupont' } }));
  });

  it('sends the template params built from the contact and the RDV', async () => {
    const { send, result } = runWith([rdvWithContact(1, 'a@example.com')]);
    await result;
    expect(send).toHaveBeenCalledWith({
      to: { email: 'a@example.com', name: 'Jean Dupont' },
      params: {
        civility: '',
        firstName: 'Jean',
        lastName: 'Dupont',
        date: 'lundi 12 octobre',
        startHour: '09:00',
        endHour: '10:00',
        rdvType: '',
      },
    });
  });
});
