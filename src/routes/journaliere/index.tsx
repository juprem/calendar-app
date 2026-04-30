import { createFileRoute } from '@tanstack/react-router';
import { DailyViewWrapper } from '#/components/DailyView/DailyViewWrapper.tsx';
import { requireCalendarAccess } from '#/server/auth.ts';

export const Route = createFileRoute('/journaliere/')({
  component: Journaliere,
  beforeLoad: async () => await requireCalendarAccess(),
});

function Journaliere() {
  return (
    <div className="p-8">
      <DailyViewWrapper />
    </div>
  );
}
