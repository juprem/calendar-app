import { prisma } from '#/db.ts';
import type { rdv } from '../../generated/prisma/client.ts';
import dayjs from 'dayjs';
import { getMonthBounds, ISO_DATE } from '#/utils/dateUtils.ts';
import type { DayWithRdv } from '#/models/CalendarModel.ts';

export type { DayWithRdv };

const RDV_INCLUDE = { contact: true } as const;

interface RdvData {
  start_hour: string;
  end_hour: string;
  name: string;
  rdv_type: string | null;
  is_confirmed: boolean | null;
  contact_id: number | null;
  additional_infos: string | null;
}

export function getDayRdv(date: Date): Promise<DayWithRdv | null> {
  return prisma.day.findFirst({
    where: { date },
    include: { rdv: { include: RDV_INCLUDE } },
  });
}

export function getWeekRdv(startDay: number, startMonth: number, startYear: number): Promise<DayWithRdv[]> {
  const start = dayjs().year(startYear).month(startMonth - 1).date(startDay);
  const end = start.add(7, 'day');

  return prisma.day.findMany({
    where: {
      date: {
        gte: new Date(start.format(ISO_DATE)),
        lt: new Date(end.format(ISO_DATE)),
      },
    },
    include: { rdv: { include: RDV_INCLUDE, orderBy: { start_hour: 'asc' } } },
    orderBy: { date: 'asc' },
  });
}

export function getMonthRdv(month: number, year: number): Promise<DayWithRdv[]> {
  const { start, end } = getMonthBounds(month, year);

  return prisma.day.findMany({
    where: {
      date: {
        gte: new Date(start.format(ISO_DATE)),
        lt: new Date(end.format(ISO_DATE)),
      },
    },
    include: { rdv: { include: RDV_INCLUDE, orderBy: { start_hour: 'asc' } } },
    orderBy: { date: 'asc' },
  });
}

/**
 * Core scheduling invariant: an Rdv cannot exist without a parent Day.
 * Finds or creates the Day record for `date`, then creates the Rdv.
 */
export async function scheduleRdv(date: Date, data: RdvData): Promise<rdv> {
  let day = await prisma.day.findFirst({ where: { date } });

  if (!day) {
    day = await prisma.day.create({ data: { date } });
  }

  return prisma.rdv.create({
    data: { ...data, day_id: day.id },
  });
}

export async function updateRdv(id: number, date: Date, data: RdvData): Promise<rdv> {
  let day = await prisma.day.findFirst({ where: { date } });

  if (!day) {
    day = await prisma.day.create({ data: { date } });
  }

  return prisma.rdv.update({
    where: { id },
    data: { ...data, day_id: day.id },
  });
}

export function deleteRdv(id: number) {
  return prisma.rdv.delete({ where: { id } });
}
