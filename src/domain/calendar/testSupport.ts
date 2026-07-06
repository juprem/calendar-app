import { Context, Effect, Layer, Option } from 'effect';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';
import type { Day, Rdv } from '#/domain/calendar/models.ts';

export { runAndExpectFailure } from '#/effect/testSupport.ts';

export const testDate = new Date('2026-01-05T00:00:00.000Z');

export const mockDay: Day = { id: 1, date: testDate };

export const mockRdv = (overrides: Partial<Rdv> = {}): Rdv => ({
  id: 1,
  dayId: mockDay.id,
  startHour: '09:00',
  endHour: '10:00',
  name: 'Test patient',
  rdvType: null,
  isConfirmed: null,
  additionalInfos: null,
  confirmationDate: null,
  confirmationMode: null,
  contactId: null,
  ...overrides,
});

type DayRepositoryShape = Context.Tag.Service<typeof DayRepository>;
type RdvRepositoryShape = Context.Tag.Service<typeof RdvRepository>;

export const mockDayRepository = (overrides: Partial<DayRepositoryShape> = {}) =>
  Layer.succeed(DayRepository, {
    findByDate: () => Effect.succeed(Option.none()),
    save: () => Effect.succeed(mockDay),
    findOrCreate: () => Effect.succeed(mockDay),
    findWithRdvsByDate: () => Effect.succeed(Option.none()),
    findManyWithRdvsInRange: () => Effect.succeed([]),
    ...overrides,
  });

export const mockRdvRepository = (overrides: Partial<RdvRepositoryShape> = {}) =>
  Layer.succeed(RdvRepository, {
    findById: () => Effect.succeed(Option.some(mockRdv())),
    findByDayId: () => Effect.succeed([]),
    save: () => Effect.succeed(mockRdv()),
    update: () => Effect.succeed(mockRdv()),
    delete: () => Effect.succeed(mockRdv()),
    ...overrides,
  });
