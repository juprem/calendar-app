import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { Day, DayWithRdvs } from '../models.ts';

export class DayRepository extends Context.Tag('DayRepository')<
  DayRepository,
  {
    readonly findByDate: (date: Date) => Effect.Effect<Option.Option<Day>, DbError>;
    readonly save: (date: Date) => Effect.Effect<Day, DbError>;
    readonly findOrCreate: (date: Date) => Effect.Effect<Day, DbError>;
    readonly findWithRdvsByDate: (date: Date) => Effect.Effect<Option.Option<DayWithRdvs>, DbError>;
    readonly findManyWithRdvsInRange: (start: Date, end: Date) => Effect.Effect<DayWithRdvs[], DbError>;
  }
>() {}
