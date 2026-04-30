import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@clerk/tanstack-react-start';

export const Route = createFileRoute('/sign-in/')({
  component: SignInPage,
});

export function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
