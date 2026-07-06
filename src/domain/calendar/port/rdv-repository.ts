import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { Rdv, RdvInsertData } from '../models.ts';

export class RdvRepository extends Context.Tag('RdvRepository')<
  RdvRepository,
  {
    readonly findById: (id: number) => Effect.Effect<Option.Option<Rdv>, DbError>;
    readonly findByDayId: (dayId: number) => Effect.Effect<Rdv[], DbError>;
    readonly save: (data: RdvInsertData & { dayId: number }) => Effect.Effect<Rdv, DbError>;
    readonly update: (id: number, data: RdvInsertData & { dayId: number }) => Effect.Effect<Rdv, DbError>;
    readonly delete: (id: number) => Effect.Effect<Rdv, DbError>;
  }
>() {}
