import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireCalendarAccess } from '#/server/auth.ts';

export const Route = createFileRoute('/_protected')({
  component: ProtectedRoute,
  beforeLoad: async () => await requireCalendarAccess(),
})


function ProtectedRoute() {
  return <Outlet />
}