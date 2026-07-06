import { Effect } from 'effect';
import { toUTCDate } from '#/utils/dateUtils.ts';
import { RdvCreateSchema, UpdateRdvSchema } from '#/domain/calendar/models.ts';
import z from 'zod';
import { protectedProcedure } from '#/configurations/trpc/init.ts';
import { RdvRepository } from '#/domain/calendar/port/rdv-repository.ts';
import { getDayRdv } from '#/domain/calendar/application/queries/getDayRdv.ts';
import { getWeekRdv } from '#/domain/calendar/application/queries/getWeekRdv.ts';
import { getMonthRdv } from '#/domain/calendar/application/queries/getMonthRdv.ts';
import { scheduleRdv } from '#/domain/calendar/application/mutations/scheduleRdv/scheduleRdv.ts';
import { updateRdv } from '#/domain/calendar/application/mutations/updateRdv/updateRdv.ts';
import { NotFoundError, RdvConflictError } from '#/effect/errors.ts';
import { catchDomainErrors } from '#/effect/toTRPCError/toTRPCError.ts';
import { runCalendarEffect } from '#/domain/calendar/application/controllers/runtime.ts';

const catchCalendarErrors = catchDomainErrors([
  [(cause): cause is RdvConflictError => cause instanceof RdvConflictError, 'CONFLICT'],
  [(cause): cause is NotFoundError => cause instanceof NotFoundError, 'NOT_FOUND'],
]);

const calendarProcedure = protectedProcedure.use(catchCalendarErrors);

export const calendarRouter = {
  listByDay: calendarProcedure
    .input(z.string())
    .query(({ input }) => runCalendarEffect(getDayRdv(toUTCDate(input)))),
  listByWeek: calendarProcedure
    .input(
      z.object({
        startDay: z.number(),
        startMonth: z.number().pipe(z.transform((month) => month + 1)),
        startYear: z.number(),
      }),
    )
    .query(({ input }) => runCalendarEffect(getWeekRdv(input.startDay, input.startMonth, input.startYear))),
  listByMonth: calendarProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ input }) => runCalendarEffect(getMonthRdv(input.month, input.year))),
  addRdv: calendarProcedure.input(RdvCreateSchema).mutation(({ input }) =>
    runCalendarEffect(
      scheduleRdv(toUTCDate(input.date), {
        startHour: input.startHour,
        endHour: input.endHour,
        name: input.name,
        rdvType: input.rdvType ?? null,
        isConfirmed: input.isConfirmed ?? null,
        contactId: input.contactId ?? null,
        additionalInfos: input.additionalInfos ?? null,
        confirmationDate: input.confirmationDate ? toUTCDate(input.confirmationDate) : null,
        confirmationMode: input.confirmationMode ?? null,
      }),
    ),
  ),
  updateRdv: calendarProcedure.input(UpdateRdvSchema).mutation(({ input }) =>
    runCalendarEffect(
      updateRdv(input.id, toUTCDate(input.date), {
        startHour: input.startHour,
        endHour: input.endHour,
        name: input.name,
        rdvType: input.rdvType ?? null,
        isConfirmed: input.isConfirmed ?? null,
        contactId: input.contactId ?? null,
        additionalInfos: input.additionalInfos ?? null,
        confirmationDate: input.confirmationDate ? toUTCDate(input.confirmationDate) : null,
        confirmationMode: input.confirmationMode ?? null,
      }),
    ),
  ),
  deleteRdv: calendarProcedure.input(z.number()).mutation(({ input }) =>
    runCalendarEffect(
      Effect.gen(function* () {
        const rdvRepository = yield* RdvRepository;
        return yield* rdvRepository.delete(input);
      }),
    ),
  ),
};
