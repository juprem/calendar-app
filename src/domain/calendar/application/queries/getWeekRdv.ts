import dayjs from 'dayjs';
import { Effect } from 'effect';
import { ISO_DATE } from '#/utils/dateUtils.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';

export const getWeekRdv = (startDay: number, startMonth: number, startYear: number) => {
  const start = dayjs()
    .year(startYear)
    .month(startMonth - 1)
    .date(startDay);
  const end = start.add(7, 'day');

  return Effect.gen(function* () {
    const dayRepository = yield* DayRepository;
    return yield* dayRepository.findManyWithRdvsInRange(
      new Date(start.format(ISO_DATE)),
      new Date(end.format(ISO_DATE)),
    );
  });
};
