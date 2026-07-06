import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { CreateGeneralPractitioner, GeneralPractitioner, UpdateGeneralPractitioner } from '../models.ts';

export class GeneralPractitionerRepository extends Context.Tag('GeneralPractitionerRepository')<
  GeneralPractitionerRepository,
  {
    readonly findById: (id: number) => Effect.Effect<Option.Option<GeneralPractitioner>, DbError>;
    readonly findAll: () => Effect.Effect<GeneralPractitioner[], DbError>;
    readonly save: (data: CreateGeneralPractitioner) => Effect.Effect<GeneralPractitioner, DbError>;
    readonly update: (
      id: number,
      data: Omit<UpdateGeneralPractitioner, 'id'>,
    ) => Effect.Effect<GeneralPractitioner, DbError>;
    readonly delete: (id: number) => Effect.Effect<GeneralPractitioner, DbError>;
  }
>() {}
