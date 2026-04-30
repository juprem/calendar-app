import { Clock, User } from 'lucide-react';

interface RdvCardProps {
  start_hour: string;
  end_hour: string;
  name: string;
  type: string | null;
  is_confirmed: boolean | null;
  onClick?: () => void;
}

export function RdvCard({ start_hour, end_hour, name, type, is_confirmed, onClick }: RdvCardProps) {
  const isConfirmed = is_confirmed === true;

  return (
    <div
      onClick={onClick}
      className="flex items-center bg-white rounded-xl border border-[#E7E5E4] px-4 py-3 mb-3 hover:border-[#92400E]/30 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 w-20 shrink-0">
        <Clock size={14} className="text-[#78716C] shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#1C1917] leading-tight">{start_hour}</p>
          <p className="text-xs text-[#78716C] leading-tight">{end_hour}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-[#E7E5E4] mx-4 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-[#78716C] shrink-0" />
          <p className="font-semibold text-[#1C1917] truncate">{name}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-3 shrink-0">
        {type && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-[#92400E] border border-amber-200 whitespace-nowrap">
            {type}
          </span>
        )}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isConfirmed ? 'bg-green-500' : 'bg-amber-400'}`} />
      </div>
    </div>
  );
}
