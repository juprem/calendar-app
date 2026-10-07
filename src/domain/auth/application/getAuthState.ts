import { Effect } from 'effect';
import { AuthProvider } from '#/domain/auth/port/auth-provider.ts';

export const getAuthState = Effect.gen(function* () {
  const authProvider = yield* AuthProvider;
  return yield* authProvider.getAuthState();
});
