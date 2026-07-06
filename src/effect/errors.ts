import { Data } from 'effect';

export class DbError extends Data.TaggedError('DbError')<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export const toDbError = (cause: unknown): DbError =>
  new DbError({ message: 'Database operation failed', cause });

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message: string;
}> {}

export class RdvConflictError extends Data.TaggedError('RdvConflictError')<{
  readonly message: string;
}> {}

export class ContactConflictError extends Data.TaggedError('ContactConflictError')<{
  readonly message: string;
}> {}
