import { Context, Effect, Layer, Option } from 'effect';
import type { EmailLog } from './models.ts';
import { EmailLogRepository } from './port/email-log-repository.ts';
import { EmailSender } from './port/email-sender.ts';

export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const mockEmailLog = (overrides: Partial<EmailLog> = {}): EmailLog => ({
  id: 1,
  rdvId: 1,
  contactId: 1,
  targetDate: new Date('2026-10-12T00:00:00.000Z'),
  recipient: 'jean.dupont@example.com',
  status: 'SENT',
  error: null,
  sentAt: new Date('2026-10-11T10:00:00.000Z'),
  ...overrides,
});

type EmailLogRepositoryShape = Context.Tag.Service<typeof EmailLogRepository>;
type EmailSenderShape = Context.Tag.Service<typeof EmailSender>;

export const mockEmailLogRepository = (overrides: Partial<EmailLogRepositoryShape> = {}) =>
  Layer.succeed(EmailLogRepository, {
    findById: () => Effect.succeed(Option.some(mockEmailLog())),
    listByTargetDate: () => Effect.succeed([]),
    findLatestTargetDate: () => Effect.succeed(Option.none()),
    record: (emailLog) => Effect.succeed(mockEmailLog(emailLog)),
    clearAll: () => Effect.void,
    ...overrides,
  });

export const mockEmailSender = (overrides: Partial<EmailSenderShape> = {}) =>
  Layer.succeed(EmailSender, {
    send: () => Effect.void,
    ...overrides,
  });
