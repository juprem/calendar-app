import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

/** ISO 8601 date string: `YYYY-MM-DD` */
export type ISODate = `${number}-${number}-${number}`;

export const ISO_DATE = 'YYYY-MM-DD' as const;

export type DateComponents = Readonly<{ year: number; month: number; day: number }>;
export type MonthBounds = Readonly<{ start: Dayjs; end: Dayjs }>;

/** Convert an ISO date string (YYYY-MM-DD) to a UTC midnight Date object. */
export const toUTCDate = (isoDate: string): Date =>
  new Date(`${isoDate}T00:00:00.000Z`);

/** Return the Monday of the ISO week containing `day`. */
export const getMondayOf = (day: Dayjs): Dayjs => {
  const dow = day.day();
  return day.subtract(dow === 0 ? 6 : dow - 1, 'day');
};

/** Return [start, end) bounds for a 1-indexed month/year. */
export const getMonthBounds = (month: number, year: number): MonthBounds => {
  const start = dayjs().year(year).month(month - 1).date(1);
  return { start, end: start.add(1, 'month') };
};

/** Extract year/month/day integers from an ISO date string. */
export const parseDateComponents = (isoDate: string): DateComponents => {
  const [year = 0, month = 0, day = 0] = isoDate.split('-').map(Number);
  return { year, month, day };
};
