import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { Contact, CreateContact, RdvHistoryEntry, UpdateContact } from '#/domain/contact/models.ts';

export class ContactRepository extends Context.Tag('ContactRepository')<
  ContactRepository,
  {
    readonly findById: (id: number) => Effect.Effect<Option.Option<Contact>, DbError>;
    readonly findByIdentity: (
      firstname: string,
      lastname: string,
      birthDate: Date,
    ) => Effect.Effect<Option.Option<Contact>, DbError>;
    readonly findByName: (firstname: string, lastname: string) => Effect.Effect<Contact[], DbError>;
    readonly findAll: () => Effect.Effect<Contact[], DbError>;
    readonly save: (data: CreateContact & { birthDate: Date }) => Effect.Effect<Contact, DbError>;
    readonly update: (id: number, data: Omit<UpdateContact, 'id'> & { birthDate: Date }) => Effect.Effect<Contact, DbError>;
    readonly delete: (id: number) => Effect.Effect<Contact, DbError>;
    readonly findAppointmentHistory: (contactId: number) => Effect.Effect<RdvHistoryEntry[], DbError>;
  }
>() {}
