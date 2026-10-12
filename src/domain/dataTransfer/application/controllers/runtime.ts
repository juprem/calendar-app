import { Effect, Layer } from 'effect';
import { DayRepositoryLive } from '#/domain/calendar/adapter/day-repository-live.ts';
import type { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { ContactRepositoryLive } from '#/domain/contact/adapter/contact-repository-live.ts';
import type { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { GeneralPractitionerRepositoryLive } from '#/domain/generalPractitioner/adapter/general-practitioner-repository-live.ts';
import type { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { runEffect } from '#/effect/runEffect.ts';
import { DataImportRepositoryLive } from '../../adapter/data-import-repository-live.ts';
import { ExportLogRepositoryLive } from '../../adapter/export-log-repository-live.ts';
import type { DataImportRepository } from '../../port/data-import-repository.ts';
import type { ExportLogRepository } from '../../port/export-log-repository.ts';

export const AppLive = Layer.mergeAll(
  ExportLogRepositoryLive,
  DataImportRepositoryLive,
  ContactRepositoryLive,
  GeneralPractitionerRepositoryLive,
  DayRepositoryLive,
);

export function runDataTransferEffect<Value, Failure>(
  effect: Effect.Effect<
    Value,
    Failure,
    ExportLogRepository | DataImportRepository | ContactRepository | GeneralPractitionerRepository | DayRepository
  >,
): Promise<Value> {
  return runEffect(effect.pipe(Effect.provide(AppLive)));
}
