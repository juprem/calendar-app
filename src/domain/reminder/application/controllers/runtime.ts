import { Effect, Layer } from 'effect';
import { DayRepositoryLive } from '#/domain/calendar/adapter/day-repository-live.ts';
import type { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { runEffect } from '#/effect/runEffect.ts';
import { toParisHour } from '#/utils/dateUtils.ts';
import { EmailLogRepositoryLive } from '../../adapter/email-log-repository-live.ts';
import { EmailSenderBrevo } from '../../adapter/emailSender/email-sender-brevo.ts';
import { EmailSenderConsole } from '../../adapter/emailSender/email-sender-console.ts';
import type { EmailLogRepository } from '../../port/email-log-repository.ts';
import type { EmailSender } from '../../port/email-sender.ts';
import { sendMondayReminders } from '../mutations/sendMondayReminders/sendMondayReminders.ts';

const REMINDER_PARIS_HOUR = 12;

const AppLive = Layer.mergeAll(
  EmailLogRepositoryLive,
  DayRepositoryLive,
  import.meta.env.DEV ? EmailSenderConsole : EmailSenderBrevo,
);

/** The single composition root: binds the email log and day repositories, and the dev console or Brevo sender, to their Live adapters. */
export function runReminderEffect<Value, Failure>(
  effect: Effect.Effect<Value, Failure, EmailLogRepository | DayRepository | EmailSender>,
): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(AppLive)));
}

/** Always sends through Brevo, even in dev, for the test email button. */
export function runBrevoEffect<Value, Failure>(effect: Effect.Effect<Value, Failure, EmailSender>): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(EmailSenderBrevo)));
}

export const isReminderHour = (now: Date): boolean => toParisHour(now) === REMINDER_PARIS_HOUR;

/** Entry point of the Sunday cron: two UTC triggers cover summer and winter time, only the one landing at noon in Paris sends. */
export async function runReminderCron(now: Date): Promise<void> {
  if (!isReminderHour(now)) return;
  const emailLogs = await runReminderEffect(sendMondayReminders(now));
  console.log(`[cron] reminders processed: ${emailLogs.length}`);
}
