import { Effect, Option } from 'effect';
import { formatContactName } from '#/utils/contactUtils.ts';
import { toParisISODate } from '#/utils/dateUtils.ts';
import type { FailedReminder, ReminderStatus } from '../../../models.ts';
import { EmailLogRepository } from '../../../port/email-log-repository.ts';
import { findRdvWithContactOn, nextMondayDate } from '../findRdvWithContactOn/findRdvWithContactOn.ts';

export const getReminderStatus = (now: Date) =>
  Effect.gen(function* () {
    const emailLogRepository = yield* EmailLogRepository;
    const latestTargetDate = yield* emailLogRepository.findLatestTargetDate();
    const targetDate = Option.getOrElse(latestTargetDate, () => nextMondayDate(now));

    const { rdvWithContact, emailLogs } = yield* Effect.all(
      {
        rdvWithContact: findRdvWithContactOn(targetDate),
        emailLogs: emailLogRepository.listByTargetDate(targetDate),
      },
      { concurrency: 'unbounded' },
    );
    const rdvById = new Map(rdvWithContact.map((rdv) => [rdv.id, rdv]));

    const failed = emailLogs
      .filter((emailLog) => emailLog.status === 'FAILED')
      .map((emailLog): FailedReminder => {
        const rdv = rdvById.get(emailLog.rdvId);
        return {
          logId: emailLog.id,
          contactName: rdv ? formatContactName(rdv.contact, { short: true }) : 'RDV modifié',
          startHour: rdv?.startHour ?? '',
          recipient: emailLog.recipient,
          error: emailLog.error,
        };
      });

    return {
      targetDate: toParisISODate(targetDate),
      hasRun: Option.isSome(latestTargetDate),
      rdvWithContactCount: rdvWithContact.length,
      sentCount: emailLogs.filter((emailLog) => emailLog.status === 'SENT').length,
      failed,
    } satisfies ReminderStatus;
  });
