import { createFileRoute } from '@tanstack/react-router';
import { MonthlyViewWrapper } from '#/components/MonthlyView/MonthlyViewWrapper.tsx';
import { requireCalendarAccess } from '#/server/auth.ts';

export const Route = createFileRoute('/mensuelle/')({
  component: Mensuelle,
  beforeLoad: async () => await requireCalendarAccess(),
});

function Mensuelle() {
  return <MonthlyViewWrapper />;
}
