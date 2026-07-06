import { Effect, Option } from 'effect';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';

export const getDayRdv = (date: Date) => Effect.gen(function* () {
  const dayRepository = yield* DayRepository;
  const dayWithRdvs = yield* dayRepository.findWithRdvsByDate(date);

  return Option.getOrNull(dayWithRdvs);
})

