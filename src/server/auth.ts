import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { getCurrentAuthState } from '#/domain/auth/runtime.ts';

export const requireCalendarAccess = createServerFn().handler(async () => {
  const { isAuthenticated, hasCalendarAccess } = await getCurrentAuthState();

  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' });
  }

  if (!hasCalendarAccess) {
    throw redirect({ to: '/forbidden' });
  }
});
