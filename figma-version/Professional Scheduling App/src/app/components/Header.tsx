import { Calendar, Plus } from 'lucide-react';
import { Button } from 'antd';
import { useLocation, useNavigate } from 'react-router';

interface HeaderProps {
  onNewAppointment?: () => void;
  onNewContact?: () => void;
}

export function Header({ onNewAppointment, onNewContact }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'daily', label: 'Journalière', path: '/' },
    { key: 'weekly', label: 'Hebdomadaire', path: '/weekly' },
    { key: 'monthly', label: 'Mensuelle', path: '/monthly' },
    { key: 'contacts', label: 'Contacts', path: '/contacts' },
  ];

  const activeKey = navItems.find(item => item.path === location.pathname)?.key || 'daily';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E7E5E4] h-12 flex items-center px-6 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <Calendar className="w-5 h-5 text-[#92400E]" strokeWidth={2.5} />
        <span className="font-semibold text-[#92400E] text-lg">Calendrier</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex items-center justify-center gap-1">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeKey === item.key
                ? 'bg-[#92400E] text-white'
                : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FEF3C7]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onNewAppointment}
          style={{
            backgroundColor: '#92400E',
            borderColor: '#92400E',
            borderRadius: '8px',
          }}
          className="hover:!bg-[#78350F]"
        >
          RDV
        </Button>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={onNewContact}
          style={{
            borderColor: '#92400E',
            color: '#92400E',
            borderRadius: '8px',
          }}
          className="hover:!bg-[#FEF3C7] hover:!border-[#92400E]"
        >
          Contact
        </Button>
      </div>
    </header>
  );
}
