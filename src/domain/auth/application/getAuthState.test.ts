import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import { mockAuthProvider } from '#/domain/auth/adapter/auth-provider-mock.ts';
import { getAuthState } from './getAuthState.ts';

describe('getAuthState', () => {
  it('resolves to an authenticated user with calendar access by default', async () => {
    const result = await Effect.runPromise(getAuthState.pipe(Effect.provide(mockAuthProvider())));

    expect(result).toEqual({ isAuthenticated: true, hasCalendarAccess: true });
  });

  it('resolves to not authenticated when the provider reports no session', async () => {
    const layer = mockAuthProvider({ isAuthenticated: false, hasCalendarAccess: false });

    const result = await Effect.runPromise(getAuthState.pipe(Effect.provide(layer)));

    expect(result).toEqual({ isAuthenticated: false, hasCalendarAccess: false });
  });

  it('resolves to authenticated without calendar access when the role is missing', async () => {
    const layer = mockAuthProvider({ hasCalendarAccess: false });

    const result = await Effect.runPromise(getAuthState.pipe(Effect.provide(layer)));

    expect(result).toEqual({ isAuthenticated: true, hasCalendarAccess: false });
  });
});
