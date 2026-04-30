import { createServerFn } from '@tanstack/react-start';
import { auth } from '@clerk/tanstack-react-start/server';
import { redirect } from '@tanstack/react-router';

export const requireCalendarAccess = createServerFn().handler(async () => {
  const { isAuthenticated, has } = await auth();

  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' });
  }

  if (!has({ role: 'calendar_access' })) {
    throw redirect({ to: '/forbidden' });
  }
});
