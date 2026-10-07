import type { ReactNode } from 'react';
import { Show } from '@clerk/tanstack-react-start';
import { isMockAuth } from '#/domain/auth/isMockAuth.ts';

interface SignedInOnlyProps {
  children: ReactNode;
}

export function SignedInOnly({ children }: SignedInOnlyProps) {
  if (isMockAuth) return children;
  return <Show when="signed-in">{children}</Show>;
}
