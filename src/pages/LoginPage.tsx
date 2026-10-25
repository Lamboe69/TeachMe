import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Form';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { toAppError } from '@/utils/apiError';
import { firstName } from '@/utils/format';
import { loginSchema } from '@/utils/schemas';
import type { LoginFormValues } from '@/utils/schemas';
import { isDemoMode } from '@/services';
import { DEMO_CREDENTIALS } from '@/services/demo/auth.service';

interface LocationState {
  registered?: boolean;
}

export function LoginPage() {
  const { login, user, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const locationState = location.state as LocationState | null;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  // Already signed in? Go straight to the right dashboard.
  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate(user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [status, user, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const account = await login({
        email: values.email.trim(),
        password: values.password,
      });

      toast.success(`Welcome back, ${firstName(account.fullName)}!`);
      navigate(account.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', {
        replace: true,
      });
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message);

      if (appError.fieldErrors.password) {
        setError('password', { message: appError.fieldErrors.password });
      }
      if (appError.fieldErrors.email) {
        setError('email', { message: appError.fieldErrors.email });
      }
    }
  });

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-green-50/30 to-emerald-50/40">
      <div className="absolute inset-0">
        <img
          src="/img/library-study.jpg"
          alt=""
          className="h-full w-full object-cover opacity-5"
        />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-soft">
                <GraduationCap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-2xl font-extrabold tracking-tight text-ink-950">TutorUG</span>
            </Link>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-ink-950">Log in</h1>
            <p className="mt-2 text-ink-700">Access your university study sessions</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200 sm:p-8">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {locationState?.registered ? (
          <Alert tone="success" title="Account created">
            Your account is ready. Log in with your new details below.
          </Alert>
        ) : null}

        {submitError ? (
          <Alert tone="error" title="We could not sign you in">
            {submitError}
          </Alert>
        ) : null}

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-sm font-medium text-green-700 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Log in'}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-500">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Your session is secured by the Tutor UG API.
        </p>

        {isDemoMode ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Info className="h-4 w-4" aria-hidden="true" />
              Demo accounts (sample data only)
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  fillDemoAccount(DEMO_CREDENTIALS.student.email, DEMO_CREDENTIALS.student.password)
                }
              >
                Use student demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  fillDemoAccount(DEMO_CREDENTIALS.tutor.email, DEMO_CREDENTIALS.tutor.password)
                }
              >
                Use tutor demo
              </Button>
            </div>
            <p className="mt-2 text-xs text-amber-800">
              Student: {DEMO_CREDENTIALS.student.email} · Tutor: {DEMO_CREDENTIALS.tutor.email} ·{' '}
              Password: {DEMO_CREDENTIALS.student.password}
            </p>
          </div>
        ) : null}
      </form>
          </div>
          <p className="mt-6 text-center text-sm text-ink-700">
            Don’t have an account?{' '}
            <Link to="/register" className="font-bold text-green-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
