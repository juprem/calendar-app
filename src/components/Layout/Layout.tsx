import { type ReactNode, useState } from 'react';
import { Button } from 'antd';
import { CalendarDays, Plus, UserPlus } from 'lucide-react';
import { Show } from '@clerk/tanstack-react-start';
import { AddRdv } from '#/components/Layout/AddRdv/AddRdv.tsx';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { AddContact } from '#/components/Layout/AddContact/AddContact.tsx';

interface LayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/journaliere', label: 'Journalière' },
  { path: '/hebdomadaire', label: 'Hebdomadaire' },
  { path: '/mensuelle', label: 'Mensuelle' },
  { path: '/contacts', label: 'Contacts' },
];

export function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-[#FFFBF5]">
      <Show when="signed-in">
        <header className="flex items-center justify-between px-6 py-2.5 border-b border-[#E7E5E4] bg-white sticky top-0 z-50">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 mr-4">
              <CalendarDays size={20} className="text-[#EA580C]" />
              <span className="text-sm font-bold text-[#1C1917] select-none tracking-tight">
                Calendrier
              </span>
            </div>
            {NAV_ITEMS.map(({ path, label }) => (
              <Button
                key={path}
                type={pathname.startsWith(path) ? 'primary' : 'text'}
                shape="round"
                size="small"
                onClick={() => navigate({ to: path })}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="primary"
              shape="round"
              icon={<Plus size={13} />}
              size="small"
              onClick={() => setOpen(true)}
            >
              RDV
            </Button>
            <AddContact />
          </div>
        </header>
        <AddRdv open={open} onClose={() => setOpen(false)} />
      </Show>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
