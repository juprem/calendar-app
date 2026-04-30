import { Calendar, CalendarDays, CalendarRange, Users, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { FloatButton } from 'antd';

interface MobileNavProps {
  onNewAppointment?: () => void;
}

export function MobileNav({ onNewAppointment }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'daily', label: 'Journalière', path: '/', icon: Calendar },
    { key: 'weekly', label: 'Hebdo', path: '/weekly', icon: CalendarDays },
    { key: 'monthly', label: 'Mensuelle', path: '/monthly', icon: CalendarRange },
    { key: 'contacts', label: 'Contacts', path: '/contacts', icon: Users },
  ];

  const activeKey = navItems.find(item => item.path === location.pathname)?.key || 'daily';

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E5E4] z-50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              >
                <Icon 
                  className={`w-6 h-6 ${isActive ? 'text-[#F59E0B]' : 'text-[#78716C]'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={`text-xs ${isActive ? 'text-[#F59E0B] font-medium' : 'text-[#78716C]'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <FloatButton
        icon={<Plus className="w-5 h-5" />}
        type="primary"
        onClick={onNewAppointment}
        style={{
          backgroundColor: '#92400E',
          width: 56,
          height: 56,
          bottom: 80,
        }}
        className="hover:!bg-[#78350F]"
      />
    </>
  );
}
