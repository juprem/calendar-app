import { Effect } from 'effect';
import type { RdvInsertData } from '#/domain/calendar/models.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';
import { ensureNoRdvConflict } from '../rdvConflict/rdvConflict.ts';

export const scheduleRdv = (date: Date, data: RdvInsertData) =>
  Effect.gen(function* () {
    const dayRepository = yield* DayRepository;
    const rdvRepository = yield* RdvRepository;

    const day = yield* dayRepository.findOrCreate(date);

    yield* ensureNoRdvConflict(day.id, data);

    return yield* rdvRepository.save({ ...data, dayId: day.id });
  });
