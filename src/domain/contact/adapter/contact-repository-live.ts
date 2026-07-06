import { Effect, Layer, Option } from 'effect';
import { prisma } from '#/db.ts';
import { toDbError } from '#/effect/errors.ts';
import { ContactRepository } from '#/domain/contact/port/contact-repository.ts';
import { toContact, toContactPrismaInput, toRdvHistoryEntry } from './mappers.ts';

export const ContactRepositoryLive = Layer.succeed(ContactRepository, {
  findById: (id) =>
    Effect.tryPromise({ try: () => prisma.contact.findUnique({ where: { id } }), catch: toDbError }).pipe(
      Effect.map(Option.fromNullable),
      Effect.map(Option.map(toContact)),
    ),
  findByFullName: (firstname, lastname) =>
    Effect.tryPromise({
      try: () => prisma.contact.findUnique({ where: { firstname_lastname: { firstname, lastname } } }),
      catch: toDbError,
    }).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(toContact))),
  findAll: () =>
    Effect.tryPromise({ try: () => prisma.contact.findMany({ orderBy: { lastname: 'asc' } }), catch: toDbError }).pipe(
      Effect.map((contacts) => contacts.map(toContact)),
    ),
  save: (data) =>
    Effect.tryPromise({ try: () => prisma.contact.create({ data: toContactPrismaInput(data) }), catch: toDbError }).pipe(
      Effect.map(toContact),
    ),
  update: (id, data) =>
    Effect.tryPromise({
      try: () => prisma.contact.update({ where: { id }, data: toContactPrismaInput(data) }),
      catch: toDbError,
    }).pipe(Effect.map(toContact)),
  delete: (id) =>
    Effect.tryPromise({ try: () => prisma.contact.delete({ where: { id } }), catch: toDbError }).pipe(
      Effect.map(toContact),
    ),
  bulkSave: (contacts) =>
    Effect.tryPromise({
      try: () => prisma.contact.createMany({ data: contacts.map(toContactPrismaInput), skipDuplicates: true }),
      catch: toDbError,
    }),
  findAppointmentHistory: (contactId) =>
    Effect.tryPromise({
      try: () =>
        prisma.rdv.findMany({
          where: { contact_id: contactId },
          include: { day: { select: { date: true } }, contact: true },
          orderBy: [{ day: { date: 'asc' } }, { start_hour: 'desc' }],
        }),
      catch: toDbError,
    }).pipe(Effect.map((rdvs) => rdvs.map(toRdvHistoryEntry))),
});
