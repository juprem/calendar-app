import { Effect, Option } from 'effect';
import { NotFoundError } from '#/effect/errors.ts';
import type { RdvInsertData } from '#/domain/calendar/models.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';
import { ensureNoRdvConflict } from '../rdvConflict/rdvConflict.ts';

export const updateRdv = (id: number, date: Date, data: RdvInsertData) =>
  Effect.gen(function* () {
    const dayRepository = yield* DayRepository;
    const rdvRepository = yield* RdvRepository;

    const existingRdv = yield* rdvRepository.findById(id);
    if (Option.isNone(existingRdv)) {
      return yield* Effect.fail(new NotFoundError({ message: `Rendez-vous introuvable (id ${id})` }));
    }

    const day = yield* dayRepository.findOrCreate(date);

    yield* ensureNoRdvConflict(day.id, data, id);

    return yield* rdvRepository.update(id, { ...data, dayId: day.id });
  });
