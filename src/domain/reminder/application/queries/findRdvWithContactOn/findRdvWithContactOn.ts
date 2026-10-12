import { Effect, Option } from 'effect';
import type { Contact } from '#/domain/contact/models.ts';
import type { Rdv, RdvWithContact } from '#/domain/calendar/models.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { getNextMondayAfter, toParisISODate, toUTCDate } from '#/utils/dateUtils.ts';

export interface RdvWithReminderContact extends Rdv {
  readonly contact: Contact;
}

const hasReminderContact = (rdv: RdvWithContact): rdv is RdvWithReminderContact => rdv.contact !== null;

export const nextMondayDate = (now: Date): Date => toUTCDate(getNextMondayAfter(toParisISODate(now)));

export const findRdvWithContactOn = (targetDate: Date) =>
  Effect.gen(function* () {
    const dayRepository = yield* DayRepository;
    const day = yield* dayRepository.findWithRdvsByDate(targetDate);
    return Option.match(day, {
      onNone: () => [],
      onSome: (dayWithRdvs) => dayWithRdvs.rdv.filter(hasReminderContact),
    });
  });
