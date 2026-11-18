import { Context, Effect } from 'effect';
import type { AuthState } from '#/domain/auth/models.ts';

export class AuthProvider extends Context.Service<
  AuthProvider,
  {
    readonly getAuthState: () => Effect.Effect<AuthState, never>;
  }
>()('AuthProvider') {}
