import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-5">
      {children}
    </div>
  );
}
