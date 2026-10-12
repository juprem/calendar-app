import { Effect, Option } from 'effect';
import { NotFoundError } from '#/effect/errors.ts';
import { EmailLogRepository } from '../../../port/email-log-repository.ts';
import { findRdvWithContactOn } from '../../queries/findRdvWithContactOn/findRdvWithContactOn.ts';
import { sendReminder } from '../sendReminder.ts';

export const resendReminder = (logId: number, now: Date) =>
  Effect.gen(function* () {
    const emailLogRepository = yield* EmailLogRepository;
    const emailLog = yield* emailLogRepository.findById(logId).pipe(
      Effect.flatMap(Option.match({
        onNone: () => Effect.fail(new NotFoundError({ message: 'Envoi introuvable' })),
        onSome: Effect.succeed,
      })),
    );

    const rdvWithContact = yield* findRdvWithContactOn(emailLog.targetDate);
    const rdv = rdvWithContact.find((candidate) => candidate.id === emailLog.rdvId);
    if (!rdv) {
      return yield* Effect.fail(new NotFoundError({ message: "Le RDV a été déplacé, supprimé ou n'a plus de contact" }));
    }

    return yield* sendReminder(rdv, emailLog.targetDate, now);
  });
