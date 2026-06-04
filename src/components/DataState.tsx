import { Spin } from 'antd';
import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface DataStateProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyText?: string;
  children: ReactNode;
}

export function DataState({
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyIcon,
  emptyText,
  children,
}: DataStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-32">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-32 gap-3 text-[#78716C]">
        <AlertCircle size={40} className="text-red-300" />
        <p className="text-sm">Une erreur est survenue</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[#78716C]">
        {emptyIcon}
        {emptyText && <p className="text-sm">{emptyText}</p>}
      </div>
    );
  }

  return <>{children}</>;
}
