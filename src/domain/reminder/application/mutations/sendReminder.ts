import dayjs from 'dayjs';
import { Effect } from 'effect';
import { formatContactName } from '#/utils/contactUtils.ts';
import { toParisISODate } from '#/utils/dateUtils.ts';
import { MISSING_EMAIL_ERROR, type ReminderEmail } from '../../models.ts';
import { EmailLogRepository } from '../../port/email-log-repository.ts';
import { EmailSender } from '../../port/email-sender.ts';
import type { RdvWithReminderContact } from '../queries/findRdvWithContactOn/findRdvWithContactOn.ts';

const buildReminderEmail = (rdv: RdvWithReminderContact, email: string, targetDate: Date): ReminderEmail => ({
  to: { email, name: formatContactName(rdv.contact, { short: true }) },
  params: {
    civility: rdv.contact.civility ?? '',
    firstName: rdv.contact.firstname,
    lastName: rdv.contact.lastname,
    date: dayjs(toParisISODate(targetDate)).format('dddd D MMMM'),
    startHour: rdv.startHour,
    endHour: rdv.endHour,
    rdvType: rdv.rdvType ?? '',
  },
});

export const sendReminder = (rdv: RdvWithReminderContact, targetDate: Date, now: Date) =>
  Effect.gen(function* () {
    const emailLogRepository = yield* EmailLogRepository;
    const emailSender = yield* EmailSender;
    const recipient = rdv.contact.email;

    const outcome = recipient
      ? yield* emailSender.send(buildReminderEmail(rdv, recipient, targetDate)).pipe(
          Effect.match({
            onSuccess: () => ({ status: 'SENT' as const, error: null }),
            onFailure: (sendError) => ({ status: 'FAILED' as const, error: sendError.message }),
          }),
        )
      : { status: 'FAILED' as const, error: MISSING_EMAIL_ERROR };

    return yield* emailLogRepository.record({
      rdvId: rdv.id,
      contactId: rdv.contact.id,
      targetDate,
      recipient,
      sentAt: now,
      ...outcome,
    });
  });
