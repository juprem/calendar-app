import { Effect, Layer } from 'effect';
import { PrismaLive } from '#/db.ts';
import { GeneralPractitionerRepositoryLive } from '#/domain/generalPractitioner/adapter/general-practitioner-repository-live.ts';
import type { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { runEffect } from '#/effect/runEffect.ts';

export const AppLive = GeneralPractitionerRepositoryLive.pipe(Layer.provide(PrismaLive));

/** The single composition root: binds the port to its Live adapter, so queries/ and mutations/ only ever depend on the port. */
export function runGeneralPractitionerEffect<Value, Failure>(
  effect: Effect.Effect<Value, Failure, GeneralPractitionerRepository>,
): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(AppLive)));
}
