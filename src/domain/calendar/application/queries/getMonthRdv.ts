import { Effect } from 'effect';
import { getMonthBounds, ISO_DATE } from '#/utils/dateUtils.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';

export const getMonthRdv = (month: number, year: number) => {
  const { start, end } = getMonthBounds(month, year);

  return Effect.gen(function* () {
    const dayRepository = yield* DayRepository;
    return yield* dayRepository.findManyWithRdvsInRange(
      new Date(start.format(ISO_DATE)),
      new Date(end.format(ISO_DATE)),
    );
  });
};
