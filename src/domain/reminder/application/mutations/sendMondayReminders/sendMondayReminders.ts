import { Effect } from 'effect';
import { EmailLogRepository } from '../../../port/email-log-repository.ts';
import { findRdvWithContactOn, nextMondayDate } from '../../queries/findRdvWithContactOn/findRdvWithContactOn.ts';
import { sendReminder } from '../sendReminder.ts';

const SEND_CONCURRENCY = 5;

export const sendMondayReminders = (now: Date) =>
  Effect.gen(function* () {
    const emailLogRepository = yield* EmailLogRepository;
    const targetDate = nextMondayDate(now);

    const { rdvWithContact, existingLogs } = yield* Effect.all(
      {
        rdvWithContact: findRdvWithContactOn(targetDate),
        existingLogs: emailLogRepository.listByTargetDate(targetDate),
      },
      { concurrency: 'unbounded' },
    );
    const alreadySentRdvIds = new Set(
      existingLogs.filter((emailLog) => emailLog.status === 'SENT').map((emailLog) => emailLog.rdvId),
    );

    return yield* Effect.forEach(
      rdvWithContact.filter((rdv) => !alreadySentRdvIds.has(rdv.id)),
      (rdv) => sendReminder(rdv, targetDate, now),
      { concurrency: SEND_CONCURRENCY },
    );
  });
