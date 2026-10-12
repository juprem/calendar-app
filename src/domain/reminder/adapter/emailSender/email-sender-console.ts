import { Effect, Layer } from 'effect';
import { EmailSender } from '../../port/email-sender.ts';

export const EmailSenderConsole = Layer.succeed(EmailSender, {
  send: (email) => Effect.sync(() => console.log('[dev] reminder email not sent', email)),
});
