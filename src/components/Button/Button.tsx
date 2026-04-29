import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  children: ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className="flex items-center cursor-pointer gap-4 hover:bg-gray-200 p-3 rounded-xl" {...props}>
      {children}
    </button>
  );
}
