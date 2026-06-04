import { CheckCircle, AlertTriangle } from 'lucide-react';

interface RdvStatusIconProps {
  isConfirmed: boolean | null;
  size?: number;
  /** 'default': coloured icons for white backgrounds; 'onBlock': use onBlockIconClass */
  variant?: 'default' | 'onBlock';
  /** Icon colour when variant='onBlock'. Comes from RdvTypeStyle.blockIcon. */
  onBlockIconClass?: string;
}

export function RdvStatusIcon({
  isConfirmed,
  size = 14,
  variant = 'default',
  onBlockIconClass,
}: RdvStatusIconProps) {
  if (variant === 'onBlock' && onBlockIconClass) {
    if (isConfirmed === true)  return <CheckCircle  size={size} className={`${onBlockIconClass} shrink-0`} />;
    if (isConfirmed === false) return <AlertTriangle size={size} className={`${onBlockIconClass} opacity-50 shrink-0`} />;
    return null;
  }

  if (isConfirmed === true)  return <CheckCircle  size={size} className="text-green-500 shrink-0" />;
  if (isConfirmed === false) return <AlertTriangle size={size} className="text-amber-400 shrink-0" />;
  return null;
}
