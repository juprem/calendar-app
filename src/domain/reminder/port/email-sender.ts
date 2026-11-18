import { Context, Effect } from 'effect';
import type { EmailSendError } from '#/effect/errors.ts';
import type { ReminderEmail } from '../models.ts';

export class EmailSender extends Context.Service<
  EmailSender,
  {
    readonly send: (email: ReminderEmail) => Effect.Effect<void, EmailSendError>;
  }
>()('EmailSender') {}
