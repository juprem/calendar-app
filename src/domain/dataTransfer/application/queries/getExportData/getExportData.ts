import dayjs from 'dayjs';
import { Effect, Option } from 'effect';
import type { DayWithRdvs } from '#/domain/calendar/models.ts';
import { DayRepository } from '#/domain/calendar/port/day-repository.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { GeneralPractitionerRepository } from '#/domain/generalPractitioner/port/general-practitioner-repository.ts';
import { ISO_DATE, toParisISODate, toUTCDate, type ISODate } from '#/utils/dateUtils.ts';
import type { ExportData, RdvExportRow } from '../../../models.ts';
import { ExportLogRepository } from '../../../port/export-log-repository.ts';

export interface ExportRange {
  readonly start: Date;
  readonly endExclusive: Date;
}

export interface SinceLastExportRange extends ExportRange {
  readonly sinceLastExportStart: ISODate | null;
}

const ROLLING_RANGE_END_EXCLUSIVE = toUTCDate('9999-12-31');

const dayAfter = (isoDate: ISODate): Date => toUTCDate(dayjs(isoDate).add(1, 'day').format(ISO_DATE));

export const computeSinceLastExportRange = (
  lastExportedAt: Option.Option<Date>,
  today: ISODate,
): SinceLastExportRange => {
  const sinceLastExportStart = Option.getOrNull(Option.map(lastExportedAt, toParisISODate));
  return {
    start: sinceLastExportStart === null ? new Date(0) : toUTCDate(sinceLastExportStart),
    endExclusive: dayAfter(today),
    sinceLastExportStart,
  };
};

export const computeRollingRange = (today: ISODate): ExportRange => ({
  start: toUTCDate(dayjs(today).subtract(1, 'month').format(ISO_DATE)),
  endExclusive: ROLLING_RANGE_END_EXCLUSIVE,
});

export const flattenDaysToRdvExportRows = (days: DayWithRdvs[]): RdvExportRow[] =>
  days.flatMap((day) =>
    day.rdv.map((rdv) => ({
      id: rdv.id,
      dayId: rdv.dayId,
      startHour: rdv.startHour,
      endHour: rdv.endHour,
      name: rdv.name,
      rdvType: rdv.rdvType,
      isConfirmed: rdv.isConfirmed,
      additionalInfos: rdv.additionalInfos,
      confirmationDate: rdv.confirmationDate,
      confirmationMode: rdv.confirmationMode,
      contactId: rdv.contactId,
      date: day.date,
      contactFirstname: rdv.contact?.firstname ?? null,
      contactLastname: rdv.contact?.lastname ?? null,
    })),
  );

export const getExportData = (now: Date) =>
  Effect.gen(function* () {
    const exportLogRepository = yield* ExportLogRepository;
    const contactRepository = yield* ContactRepository;
    const generalPractitionerRepository = yield* GeneralPractitionerRepository;
    const dayRepository = yield* DayRepository;

    const today = toParisISODate(now);
    const lastExport = yield* exportLogRepository.findLast();
    const sinceLastExportRange = computeSinceLastExportRange(
      Option.map(lastExport, (exportLog) => exportLog.exportedAt),
      today,
    );
    const rollingRange = computeRollingRange(today);

    const { contacts, practitioners, daysSinceLastExport, rollingDays } = yield* Effect.all(
      {
        contacts: contactRepository.findAll(),
        practitioners: generalPractitionerRepository.findAll(),
        daysSinceLastExport: dayRepository.findManyWithRdvsInRange(
          sinceLastExportRange.start,
          sinceLastExportRange.endExclusive,
        ),
        rollingDays: dayRepository.findManyWithRdvsInRange(rollingRange.start, rollingRange.endExclusive),
      },
      { concurrency: 'unbounded' },
    );

    return {
      exportedAt: now,
      sinceLastExportStart: sinceLastExportRange.sinceLastExportStart,
      today,
      contacts,
      practitioners,
      rdvSinceLastExport: flattenDaysToRdvExportRows(daysSinceLastExport),
      rdvRolling: flattenDaysToRdvExportRows(rollingDays),
    } satisfies ExportData;
  });
