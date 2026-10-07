import { Effect, Layer } from 'effect';
import { auth } from '@clerk/tanstack-react-start/server';
import { AuthProvider } from '#/domain/auth/port/auth-provider.ts';

const SIGNED_OUT = { isAuthenticated: false, hasCalendarAccess: false };

export const ClerkAuthProviderLive = Layer.succeed(AuthProvider, {
  getAuthState: () =>
    Effect.tryPromise(() =>
      auth().then((clerkAuthState) => ({
        isAuthenticated: clerkAuthState.isAuthenticated,
        hasCalendarAccess: clerkAuthState.isAuthenticated && clerkAuthState.has({ role: 'calendar_access' }),
      })),
    ).pipe(Effect.catchAll(() => Effect.succeed(SIGNED_OUT))),
});
