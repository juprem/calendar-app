import { Effect } from 'effect';
import { protectedProcedure } from '#/configurations/trpc/init.ts';
import { EmailSendError, NotFoundError } from '#/effect/errors.ts';
import { catchDomainErrors } from '#/effect/toTRPCError/toTRPCError.ts';
import { ResendReminderSchema } from '../../models.ts';
import { EmailLogRepository } from '../../port/email-log-repository.ts';
import { EmailSender } from '../../port/email-sender.ts';
import { resendReminder } from '../mutations/resendReminder/resendReminder.ts';
import { getReminderStatus } from '../queries/getReminderStatus/getReminderStatus.ts';
import { runBrevoEffect, runReminderEffect } from './runtime.ts';

const reminderProcedure = protectedProcedure.use(
  catchDomainErrors([
    [(cause): cause is NotFoundError => cause instanceof NotFoundError, 'NOT_FOUND'],
    [(cause): cause is EmailSendError => cause instanceof EmailSendError, 'BAD_GATEWAY'],
  ]),
);

const TEST_EMAIL_PARAMS = {
  civility: 'Mr',
  firstName: 'Test',
  lastName: 'Rappel',
  date: 'lundi 1 janvier',
  startHour: '09:00',
  endHour: '10:00',
  rdvType: 'Test',
};

export const reminderRouter = {
  getStatus: reminderProcedure.query(() => runReminderEffect(getReminderStatus(new Date()))),
  resend: reminderProcedure
    .input(ResendReminderSchema)
    .mutation(({ input }) => runReminderEffect(resendReminder(input, new Date()))),
  clearLog: reminderProcedure.mutation(() =>
    runReminderEffect(
      Effect.gen(function* () {
        const emailLogRepository = yield* EmailLogRepository;
        yield* emailLogRepository.clearAll();
      }),
    ),
  ),
  sendTest: reminderProcedure.mutation(() =>
    runBrevoEffect(
      Effect.gen(function* () {
        const emailSender = yield* EmailSender;
        const recipient = process.env.REMINDER_TEST_RECIPIENT;
        if (!recipient) {
          return yield* Effect.fail(
            new EmailSendError({ message: 'REMINDER_TEST_RECIPIENT manquant dans la configuration' }),
          );
        }
        yield* emailSender.send({ to: { email: recipient, name: 'Test' }, params: TEST_EMAIL_PARAMS });
        return recipient;
      }),
    ),
  ),
};
