import { Context, Effect, Layer, Option } from 'effect';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import type { Contact } from '#/domain/contact/models.ts';
export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const mockContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 1,
  firstname: 'Jean',
  lastname: 'Dupont',
  email: null,
  phoneNumber: null,
  notes: null,
  birthDate: new Date('1990-01-01T00:00:00.000Z'),
  birthLocation: null,
  address: null,
  civility: null,
  generalPractitionerId: null,
  ...overrides,
});

type ContactRepositoryShape = Context.Tag.Service<typeof ContactRepository>;

export const mockContactRepository = (overrides: Partial<ContactRepositoryShape> = {}) =>
  Layer.succeed(ContactRepository, {
    findById: () => Effect.succeed(Option.some(mockContact())),
    findByFullName: () => Effect.succeed(Option.none()),
    findAll: () => Effect.succeed([]),
    save: () => Effect.succeed(mockContact()),
    update: () => Effect.succeed(mockContact()),
    delete: () => Effect.succeed(mockContact()),
    bulkSave: () => Effect.succeed({ count: 0 }),
    findAppointmentHistory: () => Effect.succeed([]),
    ...overrides,
  });
