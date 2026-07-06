import { Context, Effect, Option } from 'effect';
import type { DbError } from '#/effect/errors.ts';
import type { BulkCreateResult, Contact, CreateContact, RdvHistoryEntry, UpdateContact } from '#/domain/contact/models.ts';

export class ContactRepository extends Context.Tag('ContactRepository')<
  ContactRepository,
  {
    readonly findById: (id: number) => Effect.Effect<Option.Option<Contact>, DbError>;
    readonly findByFullName: (firstname: string, lastname: string) => Effect.Effect<Option.Option<Contact>, DbError>;
    readonly findAll: () => Effect.Effect<Contact[], DbError>;
    readonly save: (data: CreateContact) => Effect.Effect<Contact, DbError>;
    readonly update: (id: number, data: Omit<UpdateContact, 'id'>) => Effect.Effect<Contact, DbError>;
    readonly delete: (id: number) => Effect.Effect<Contact, DbError>;
    readonly bulkSave: (contacts: CreateContact[]) => Effect.Effect<BulkCreateResult, DbError>;
    readonly findAppointmentHistory: (contactId: number) => Effect.Effect<RdvHistoryEntry[], DbError>;
  }
>() {}
