import z from 'zod';
import { publicProcedure } from '../init';
import { prisma } from '#/db.ts';
import dayjs from 'dayjs';

export const RdvCreateSchema = z.object({
  date: z.string(),
  name: z.string(),
  start_hour: z.string(),
  end_hour: z.string(),
  rdv_type: z.string().optional(),
  is_confirmed: z.boolean().optional(),
});

const toUTCDate = (isoDate: string) => new Date(`${isoDate}T00:00:00.000Z`);

export const calendarRouter = {
  listByDay: publicProcedure
    .input(z.string())
    .query(({ input }) =>
      prisma.day.findFirst({
        where: { date: toUTCDate(input) },
        include: { rdv: true },
      }),
    ),
  listByWeek: publicProcedure
    .input(z.object({ startDay: z.number(), startMonth: z.number(), startYear: z.number() }))
    .query(async ({ input }) => {
      const start = dayjs().year(input.startYear).month(input.startMonth - 1).date(input.startDay);
      return Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const d = start.add(i, 'day');
          return prisma.day.findFirst({
            where: { date: new Date(d.format('YYYY-MM-DD')) },
            include: { rdv: true },
          });
        }),
      );
    }),
  listByMonth: publicProcedure
    .input(z.object({ month: z.number(), year: z.number() }))
    .query(({ input }) => {
      const startMonth = dayjs().year(input.year).month(input.month - 1).date(1);
      const startNextMonth = startMonth.add(1, 'month');

      return prisma.day.findMany({
        where: {
          date: {
            gte: new Date(startMonth.format('YYYY-MM-DD')),
            lt: new Date(startNextMonth.format('YYYY-MM-DD')),
          },
        },
        include: { rdv: { orderBy: { start_hour: 'asc' } } },
        orderBy: { date: 'asc' },
      })
      },
    ),
  addRdv: publicProcedure.input(RdvCreateSchema).mutation(async ({ input }) => {
    const date = toUTCDate(input.date);

    let day = await prisma.day.findFirst({ where: { date } });

    if (!day) {
      day = await prisma.day.create({ data: { date } });
    }

    return prisma.rdv.create({
      data: {
        start_hour: input.start_hour,
        end_hour: input.end_hour,
        name: input.name,
        day_id: day.id,
        rdv_type: input.rdv_type ?? null,
        is_confirmed: input.is_confirmed ?? null,
      },
    });
  }),
};
