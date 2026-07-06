import { Effect, Layer } from 'effect';
import { DayRepositoryLive } from '#/domain/calendar/adapter/day-repository-live.ts';
import { RdvRepositoryLive } from '#/domain/calendar/adapter/rdv-repository-live.ts';
import type { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import type { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';
import { runEffect } from '#/effect/runEffect.ts';

export const AppLive = Layer.merge(DayRepositoryLive, RdvRepositoryLive);

/** The single composition root: binds every port to its Live adapter, so queries/ and commands/ only ever depend on ports. */
export function runCalendarEffect<Value, Failure>(
  effect: Effect.Effect<Value, Failure, DayRepository | RdvRepository>,
): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(AppLive)));
}
