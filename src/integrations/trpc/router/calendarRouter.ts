import { publicProcedure } from '../init';
import { toUTCDate } from '#/utils/dateUtils.ts';
import { getDayRdv, getWeekRdv, getMonthRdv, scheduleRdv, updateRdv, deleteRdv } from '#/server/calendarDomain.ts';
import { RdvCreateSchema, UpdateRdvSchema } from '#/models/RdvModel.ts';
import z from 'zod';

export const calendarRouter = {
  listByDay: publicProcedure.input(z.string()).query(({ input }) => getDayRdv(toUTCDate(input))),
  listByWeek: publicProcedure
    .input(
      z.object({
        startDay: z.number(),
        startMonth: z.number().pipe(z.transform((month) => month + 1)),
        startYear: z.number(),
      }),
    )
    .query(({ input }) => getWeekRdv(input.startDay, input.startMonth, input.startYear)),
  listByMonth: publicProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ input }) => getMonthRdv(input.month, input.year)),
  addRdv: publicProcedure.input(RdvCreateSchema).mutation(({ input }) =>
    scheduleRdv(toUTCDate(input.date), {
      start_hour: input.start_hour,
      end_hour: input.end_hour,
      name: input.name,
      rdv_type: input.rdv_type ?? null,
      is_confirmed: input.is_confirmed ?? null,
      contact_id: input.contact_id ?? null,
      additional_infos: input.additional_infos ?? null,
    }),
  ),
  updateRdv: publicProcedure.input(UpdateRdvSchema).mutation(async ({ input }) =>
    await updateRdv(input.id, toUTCDate(input.date), {
      start_hour: input.start_hour,
      end_hour: input.end_hour,
      name: input.name,
      rdv_type: input.rdv_type ?? null,
      is_confirmed: input.is_confirmed ?? null,
      contact_id: input.contact_id ?? null,
      additional_infos: input.additional_infos ?? null,
    }),
  ),
  deleteRdv: publicProcedure.input(z.number()).mutation(({ input }) => deleteRdv(input)),
};
