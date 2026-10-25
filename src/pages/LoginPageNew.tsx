import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { toAppError } from '@/utils/apiError';
import { loginSchema } from '@/utils/schemas';
import type { LoginFormValues } from '@/utils/schemas';
import { BrandStage } from '@/components/auth/BrandStage';
import { DEMO_MODE } from '@/app/config';

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function LoginPageNew() {
  const navigate = useNavigate();
  const { login, status, user } = useAuth();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  if (status === 'authenticated' && user) {
    navigate(user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const account = await login({
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`Welcome back, ${firstName(account.fullName)}!`);
      navigate(account.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message || "That email or password isn't right. Try again or reset your password.");
    }
  });

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:block">
        <BrandStage mode="login" />
      </div>
      
      <div className="flex min-h-screen flex-col bg-[#fefdfb]">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 transition hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link to="/register" className="text-sm font-semibold text-green-700 transition hover:underline">
            New here? Create account
          </Link>
        </header>

        <div className="lg:hidden">
          <div className="mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 to-emerald-800 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white">
                <span className="text-lg font-bold text-green-700">T</span>
              </div>
              <span className="font-display text-xl font-extrabold text-white">TutorUG</span>
            </div>
            <p className="mt-3 text-sm text-white/90">Welcome back. Your next session is waiting.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">Log in</h1>
              <p className="mt-2 text-ink-700">Access your university study sessions</p>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {submitError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-900">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    placeholder="you@university.ac.ug"
                    autoComplete="email"
                    className={`h-12 w-full rounded-xl border pl-10 text-ink-900 transition focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-ink-300 focus:border-green-500 focus:ring-green-100'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-ink-900">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-green-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`h-12 w-full rounded-xl border pl-10 pr-12 text-ink-900 transition focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                        : 'border-ink-300 focus:border-green-500 focus:ring-green-100'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-base font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>

              <div className="flex items-center gap-2 text-sm text-ink-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Your data is encrypted</span>
              </div>

              {DEMO_MODE && (
                <button
                  type="button"
                  onClick={() => setShowDemo(!showDemo)}
                  className="w-full text-center text-sm text-ink-500 hover:text-ink-700"
                >
                  Try a demo account
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
