import { Effect, Layer } from 'effect';
import { AuthProvider } from '#/domain/auth/port/auth-provider.ts';
import type { AuthState } from '#/domain/auth/models.ts';

export const mockAuthProvider = (overrides: Partial<AuthState> = {}) =>
  Layer.succeed(AuthProvider, {
    getAuthState: () => Effect.succeed({ isAuthenticated: true, hasCalendarAccess: true, ...overrides }),
  });
