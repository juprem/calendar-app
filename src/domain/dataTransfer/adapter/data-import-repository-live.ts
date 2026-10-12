import { Effect, Layer } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { truncateToUTCDate } from '#/utils/dateUtils.ts';
import { DataImportRepository } from '../port/data-import-repository.ts';
import type { ImportCount } from '../models.ts';
import { toContactUpsertArgs, toPractitionerUpsertArgs, toRdvUpsertArgs } from './mappers.ts';

const resetSequenceStatement = (tableName: string) =>
  `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM ${tableName}), 1))`;

const toCount = (importedIds: number[], existingRows: { id: number }[]): ImportCount => {
  const existingIds = new Set(existingRows.map((existingRow) => existingRow.id));
  const updated = importedIds.filter((importedId) => existingIds.has(importedId)).length;
  return { created: importedIds.length - updated, updated };
};

export const DataImportRepositoryLive = Layer.succeed(DataImportRepository, {
  applyImport: (data) =>
    Effect.tryPromise({
      try: async () => {
        const practitionerIds = data.practitioners.map((row) => row.id);
        const contactIds = data.contacts.map((row) => row.id);
        const rdvIds = data.rdvs.map((row) => row.id);

        const [existingPractitioners, existingContacts, existingRdvs] = await Promise.all([
          prisma.general_practitioner.findMany({ where: { id: { in: practitionerIds } }, select: { id: true } }),
          prisma.contact.findMany({ where: { id: { in: contactIds } }, select: { id: true } }),
          prisma.rdv.findMany({ where: { id: { in: rdvIds } }, select: { id: true } }),
        ]);

        const distinctRdvDates = [...new Set(data.rdvs.map((row) => truncateToUTCDate(row.date).getTime()))].map(
          (timestamp) => new Date(timestamp),
        );
        const days = await Promise.all(
          distinctRdvDates.map((date) => prisma.day.upsert({ where: { date }, create: { date }, update: {} })),
        );
        const dayIdByTimestamp = new Map(days.map((day) => [day.date.getTime(), day.id]));

        const findDayId = (date: Date): number => {
          const dayId = dayIdByTimestamp.get(truncateToUTCDate(date).getTime());
          if (dayId === undefined) throw new Error(`Day row missing for ${date.toISOString()}`);
          return dayId;
        };

        await prisma.$transaction([
          ...data.practitioners.map((row) => prisma.general_practitioner.upsert(toPractitionerUpsertArgs(row))),
          ...data.contacts.map((row) => prisma.contact.upsert(toContactUpsertArgs(row))),
          ...data.rdvs.map((row) => prisma.rdv.upsert(toRdvUpsertArgs(row, findDayId(row.date)))),
          prisma.$executeRawUnsafe(resetSequenceStatement('general_practitioner')),
          prisma.$executeRawUnsafe(resetSequenceStatement('contact')),
          prisma.$executeRawUnsafe(resetSequenceStatement('rdv')),
        ]);

        return {
          practitioners: toCount(practitionerIds, existingPractitioners),
          contacts: toCount(contactIds, existingContacts),
          rdvs: toCount(rdvIds, existingRdvs),
        };
      },
      catch: toDbError,
    }),
});
