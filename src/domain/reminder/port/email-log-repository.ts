import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { EmailLog, EmailLogRecord } from '../models.ts';

export class EmailLogRepository extends Context.Tag('EmailLogRepository')<
  EmailLogRepository,
  {
    readonly findById: (id: number) => Effect.Effect<Option.Option<EmailLog>, DbError>;
    readonly listByTargetDate: (targetDate: Date) => Effect.Effect<EmailLog[], DbError>;
    readonly findLatestTargetDate: () => Effect.Effect<Option.Option<Date>, DbError>;
    readonly record: (emailLog: EmailLogRecord) => Effect.Effect<EmailLog, DbError>;
    readonly clearAll: () => Effect.Effect<void, DbError>;
  }
>() {}
