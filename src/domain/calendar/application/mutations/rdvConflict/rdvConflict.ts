import { Effect } from 'effect';
import { RdvConflictError } from '#/effect/errors.ts';
import type { Rdv, RdvInsertData } from '#/domain/calendar/models.ts';
import { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';

const overlaps = (data: RdvInsertData, existingRdv: Rdv) =>
  (data.startHour > existingRdv.startHour && data.startHour < existingRdv.endHour) ||
  (data.endHour < existingRdv.endHour && data.endHour > existingRdv.startHour) ||
  (data.startHour < existingRdv.startHour && data.endHour > existingRdv.endHour);

export const ensureNoRdvConflict = (dayId: number, data: RdvInsertData, excludingRdvId?: number) =>
  Effect.gen(function* () {
    const rdvRepository = yield* RdvRepository;
    const rdvsOnDay = yield* rdvRepository.findByDayId(dayId);

    const conflictingRdv = rdvsOnDay.find(
      (existingRdv) => existingRdv.id !== excludingRdvId && overlaps(data, existingRdv),
    );

    if (conflictingRdv) {
      return yield* Effect.fail(
        new RdvConflictError({
          message: `Conflit avec "${conflictingRdv.name}" (${conflictingRdv.startHour}–${conflictingRdv.endHour})`,
        }),
      );
    }
  });
