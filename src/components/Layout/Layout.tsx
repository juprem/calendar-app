import { type ReactNode } from 'react';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from '#/components/Button/Button.tsx';
import { useCalendarStore } from '#/store/calendarStore.ts';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const setCalendarMode = useCalendarStore((state) => state.setCalendarMode);

  return (
    <div className="relative">
      <div className="sticky flex items-center gap-4 p-8 h-[60px] top-0 z-50 bg-[var(--color-neutral-white)]/80 backdrop-blur-md shadow-[var(--shadow-sm)]">
        <Button onClick={() => setCalendarMode('DAILY')}>
          <Calendar /> Journalière
        </Button>
        <Button onClick={() => setCalendarMode('WEEKLY')}>
          <CalendarDays /> Hebdomadaire
        </Button>
        <Button onClick={() => setCalendarMode('MONTHLY')}>
          <CalendarRange /> Mensuelle
        </Button>
      </div>
      <div className="pl-16">{children}</div>
    </div>
  );
}
