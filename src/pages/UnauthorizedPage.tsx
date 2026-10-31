import { Lock, ShieldAlert } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export function UnauthorizedPage() {
  const { user } = useAuth();
  const homePath = user?.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard';

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Card theme="light" className="w-full max-w-lg p-8 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-600">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">
          You do not have access to this page
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
          {user
            ? `This page is not available for a ${user.role === 'TUTOR' ? 'tutor' : 'student'} account. If you think this is a mistake, contact support and we will take a look.`
            : 'This page is only available to signed-in accounts. Please log in with the account that should have access.'}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {user ? (
            <ButtonLink theme="light" to={homePath}>Go to my dashboard</ButtonLink>
          ) : (
            <ButtonLink theme="light" to="/login">Log in</ButtonLink>
          )}
          <ButtonLink theme="light" to="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>

        <p className="mt-8 flex items-start gap-2 border-t border-ink-100 pt-5 text-left text-xs text-ink-500">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Access is enforced by the Tutor UG API. Hiding a link in the interface does not grant
          permission — the server checks every request.
        </p>

        <p className="mt-4 text-xs text-ink-400">
          Need help? Email{' '}
          <a href="mailto:support@tutorug.ug" className="text-brand-700 underline">
            support@tutorug.ug
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
