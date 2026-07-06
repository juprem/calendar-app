import { TRPCError } from '@trpc/server';
import { middleware } from '#/configurations/trpc/init.ts';
import { DbError } from '#/effect/errors.ts';

type TRPCErrorCode = ConstructorParameters<typeof TRPCError>[0]['code'];

export type DomainErrorMapping = readonly [
  isMatch: (cause: unknown) => cause is { message: string },
  code: TRPCErrorCode,
];

const GENERIC_DB_ERROR_MESSAGE = 'Une erreur est survenue, veuillez réessayer.';

export function mapDomainErrorToTRPCError(
  cause: unknown,
  errorMappings: readonly DomainErrorMapping[],
): TRPCError | null {
  for (const [isMatch, code] of errorMappings) {
    if (isMatch(cause)) return new TRPCError({ code, message: cause.message });
  }

  if (cause instanceof DbError) {
    return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: GENERIC_DB_ERROR_MESSAGE });
  }

  return null;
}

export const catchDomainErrors = (errorMappings: readonly DomainErrorMapping[]) =>
  middleware(async ({ next }) => {
    const result = await next();
    if (result.ok) return result;

    const mappedError = mapDomainErrorToTRPCError(result.error.cause, errorMappings);
    if (mappedError) throw mappedError;

    throw result.error;
  });
