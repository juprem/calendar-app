import { describe, expect, it } from 'vitest';
import { DbError, NotFoundError, RdvConflictError } from '#/effect/errors.ts';
import { mapDomainErrorToTRPCError } from './toTRPCError.ts';

const isRdvConflictError = (cause: unknown): cause is RdvConflictError => cause instanceof RdvConflictError;
const isNotFoundError = (cause: unknown): cause is NotFoundError => cause instanceof NotFoundError;

describe('mapDomainErrorToTRPCError', () => {
  it('maps a matched domain error to its configured TRPCError code', () => {
    const error = mapDomainErrorToTRPCError(new RdvConflictError({ message: 'boom' }), [[isRdvConflictError, 'CONFLICT']]);

    expect(error?.code).toBe('CONFLICT');
    expect(error?.message).toBe('boom');
  });

  it('checks mappings in order and stops at the first match', () => {
    const error = mapDomainErrorToTRPCError(new NotFoundError({ message: 'missing' }), [
      [isRdvConflictError, 'CONFLICT'],
      [isNotFoundError, 'NOT_FOUND'],
    ]);

    expect(error?.code).toBe('NOT_FOUND');
  });

  it('falls back to a generic INTERNAL_SERVER_ERROR for a DbError not otherwise mapped', () => {
    const error = mapDomainErrorToTRPCError(new DbError({ message: 'boom', cause: undefined }), []);

    expect(error?.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('returns null for an error matching no mapping and not a DbError', () => {
    const error = mapDomainErrorToTRPCError(new Error('unexpected'), []);

    expect(error).toBeNull();
  });
});
