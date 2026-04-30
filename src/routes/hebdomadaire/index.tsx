import { createFileRoute } from '@tanstack/react-router';
import { WeeklyViewWrapper } from '#/components/WeeklyView/WeeklyViewWrapper.tsx';
import { requireCalendarAccess } from '#/server/auth.ts';

export const Route = createFileRoute('/hebdomadaire/')({
  component: Hebdomadaire,
  beforeLoad: async () => await requireCalendarAccess(),
});

function Hebdomadaire() {
  return (
    <div className="px-6 h-full overflow-hidden flex flex-col">
      <WeeklyViewWrapper />
    </div>
  );
}
