import { Context, Effect, Layer, Option } from 'effect';
import { GeneralPractitionerRepository } from './port/general-practitioner-repository.ts';
import type { GeneralPractitioner } from './models.ts';

export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const mockGeneralPractitioner = (overrides: Partial<GeneralPractitioner> = {}): GeneralPractitioner => ({
  id: 1,
  firstname: 'Jean',
  lastname: 'Dupont',
  address: null,
  ...overrides,
});

type GeneralPractitionerRepositoryShape = Context.Tag.Service<typeof GeneralPractitionerRepository>;

export const mockGeneralPractitionerRepository = (
  overrides: Partial<GeneralPractitionerRepositoryShape> = {},
) =>
  Layer.succeed(GeneralPractitionerRepository, {
    findById: () => Effect.succeed(Option.some(mockGeneralPractitioner())),
    findAll: () => Effect.succeed([]),
    save: () => Effect.succeed(mockGeneralPractitioner()),
    update: () => Effect.succeed(mockGeneralPractitioner()),
    delete: () => Effect.succeed(mockGeneralPractitioner()),
    ...overrides,
  });
