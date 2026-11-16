import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { LifeBuoy, MailCheck, ShieldAlert } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { PASSWORD_RESET_ENABLED } from '@/app/config';
import { toAppError } from '@/utils/apiError';
import { forgotPasswordSchema } from '@/utils/schemas';
import type { ForgotPasswordFormValues } from '@/utils/schemas';
import { asset } from '@/utils/asset';

/**
 * Password reset.
 *
 * The agreed MVP backend contract does not include a password-reset
 * endpoint, so this page is honest about that rather than pretending an
 * email was sent. Set `VITE_PASSWORD_RESET_ENABLED=true` once the Spring
 * Boot team implements `POST /api/auth/forgot-password` and the form will
 * post to the real API.
 */
export function ForgotPasswordPage() {
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await services.auth.requestPasswordReset(values.email.trim());
      setSent(true);
      toast.success('Reset request sent', 'Check your inbox for further instructions.');
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message);
    }
  });

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#030407' }}>
      <div className="absolute inset-0">
        <img
          src={asset('/img/library-study.jpg')}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-10"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(3,4,7,0.95) 0%, rgba(3,4,7,0.85) 50%, rgba(21,88,201,0.5) 100%)',
          }}
        />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: '#D4FF24' }}>
                <GraduationCap className="h-7 w-7" style={{ color: '#030407' }} aria-hidden="true" />
              </div>
              <span className="font-display text-2xl font-extrabold tracking-tight text-white">TutorUG</span>
            </Link>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-white">Reset your password</h1>
            <p className="mt-2 text-white/60">Enter the email address you registered with</p>
          </div>
          <div
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.3)' }}
          >
            {PASSWORD_RESET_ENABLED ? (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                {submitError ? (
                  <Alert tone="error" title="We could not send the reset email">
                    {submitError}
                  </Alert>
                ) : null}

                {sent ? (
                  <Alert tone="success" title="Check your email">
                    If an account exists for that address, a reset link is on its way. The link
                    expires shortly for your security.
                  </Alert>
                ) : null}

                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@university.ac.ug"
                  autoComplete="email"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />

                <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                  {isSubmitting ? 'Sending request…' : 'Send reset link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <Alert tone="warning" title="Password reset is not available yet">
                  The TutorUG API does not currently expose a password reset endpoint, so we cannot
                  send reset emails from this release. We would rather tell you plainly than pretend
                  an email is on its way.
                </Alert>

                <div className="rounded-xl border border-[rgba(21,88,201,0.3)] bg-[rgba(21,88,201,0.06)] p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <LifeBuoy className="h-4 w-4 text-[#D4FF24]" aria-hidden="true" />
                    How to recover access right now
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-white/60">
                    <li className="flex gap-2">
                      <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                      Contact support at{' '}
                      <a href="mailto:support@tutorug.ug" className="font-medium text-[#D4FF24] underline">
                        support@tutorug.ug
                      </a>{' '}
                      with your full name and the email you registered with.
                    </li>
                    <li className="flex gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                      If you are a tutor with an existing session, your coordinator can verify your
                      identity and reset the password for you.
                    </li>
                  </ul>
                </div>

                <ButtonLink to="/login" variant="outline" fullWidth>
                  Back to log in
                </ButtonLink>
              </div>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-white/50">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-[#D4FF24] hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}