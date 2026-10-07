import { Effect, Layer } from 'effect';
import { AuthProvider } from '#/domain/auth/port/auth-provider.ts';
import { mockAuthProvider } from '#/domain/auth/adapter/auth-provider-mock.ts';
import { getAuthState } from '#/domain/auth/application/getAuthState.ts';
import { isMockAuth } from '#/domain/auth/isMockAuth.ts';
import { runEffect } from '#/effect/runEffect.ts';

async function resolveAuthProviderLive(): Promise<Layer.Layer<AuthProvider>> {
  if (isMockAuth) return mockAuthProvider();
  const { ClerkAuthProviderLive } = await import('#/domain/auth/adapter/auth-provider-live.ts');
  return ClerkAuthProviderLive;
}

export const getCurrentAuthState = async () =>
  runEffect(getAuthState.pipe(Effect.provide(await resolveAuthProviderLive())));
