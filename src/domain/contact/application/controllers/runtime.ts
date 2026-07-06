import { Effect, Layer } from 'effect';
import { ContactRepositoryLive } from '#/domain/contact/adapter/contact-repository-live.ts';
import type { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { GeneralPractitionerRepositoryLive } from '#/domain/generalPractitioner/adapter/general-practitioner-repository-live.ts';
import type { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { runEffect } from '#/effect/runEffect.ts';

export const AppLive = Layer.merge(ContactRepositoryLive, GeneralPractitionerRepositoryLive);

/** The single composition root: binds ContactRepository (and GeneralPractitionerRepository, needed to validate a contact's linked GP) to their Live adapters, so queries/ and mutations/ only ever depend on the ports. */
export function runContactEffect<Value, Failure>(
  effect: Effect.Effect<Value, Failure, ContactRepository | GeneralPractitionerRepository>,
): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(AppLive)));
}
