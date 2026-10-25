import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Form';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { toAppError } from '@/utils/apiError';
import { registerSchema } from '@/utils/schemas';
import type { RegisterFormValues } from '@/utils/schemas';
import { cn } from '@/utils/cn';

type Role = 'STUDENT' | 'TUTOR';

const ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    value: 'STUDENT',
    label: 'I am a student',
    description: 'Find tutors and book sessions for your subjects.',
    icon: UserRound,
  },
  {
    value: 'TUTOR',
    label: 'I am a tutor',
    description: 'Offer lessons, set your rate and manage requests.',
    icon: GraduationCap,
  },
];

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
      acceptTerms: false,
    },
  });

  const role = watch('role');

  useEffect(() => {
    const requested = searchParams.get('role');
    if (requested === 'TUTOR' || requested === 'STUDENT') {
      setValue('role', requested, { shouldValidate: false });
    }
  }, [searchParams, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setFormError(null);

    try {
      const result = await registerAccount({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      const authenticated = result.token !== null;

      if (authenticated) {
        toast.success('Welcome to Tutor UG!', 'Your account is ready.');
        navigate(values.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', {
          replace: true,
        });
        return;
      }

      toast.success(
        'Account created',
        'Log in with your new details to start using Tutor UG.',
      );
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message);

      Object.entries(appError.fieldErrors).forEach(([field, message]) => {
        if (field === 'fullName' || field === 'email' || field === 'password') {
          setError(field as 'fullName' | 'email' | 'password', { message });
        }
        if (field === 'confirmPassword') {
          setError('confirmPassword', { message });
        }
      });

      if (appError.status === 409) {
        setFormError('An account already exists with that email address.');
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-green-50/30 to-emerald-50/40">
      <div className="absolute inset-0">
        <img
          src="/img/university-campus.jpg"
          alt=""
          className="h-full w-full object-cover opacity-5"
        />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-soft">
                <GraduationCap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-2xl font-extrabold tracking-tight text-ink-950">TutorUG</span>
            </Link>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-ink-950">Create account</h1>
            <p className="mt-2 text-ink-700">Join as a university student to learn or earn</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-200 sm:p-8">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        {submitError ? <Alert tone="error">{submitError}</Alert> : null}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-800">
            How are you joining Tutor UG?
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-xl border p-4 transition',
                    selected
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={selected}
                    onChange={() => setValue('role', option.value, { shouldDirty: true })}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                      selected ? 'bg-green-700 text-white' : 'bg-ink-100 text-ink-500',
                    )}
                    aria-hidden="true"
                  >
                    <option.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-900">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.role ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.role.message}</p>
          ) : null}
        </fieldset>

        <Input
          label="Full name"
          placeholder="e.g. Mary Namutebi"
          autoComplete="name"
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint="Use at least 8 characters, including a letter and a number."
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-green-700 focus:ring-green-500"
              {...register('acceptTerms')}
            />
            <span>
              I agree to Tutor UG&apos;s terms of use and privacy policy, and I understand that
              payments are arranged directly with tutors.
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.acceptTerms.message}</p>
          ) : null}
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          {isSubmitting ? 'Creating your account…' : 'Create my account'}
        </Button>
      </form>
          </div>
          <p className="mt-6 text-center text-sm text-ink-700">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-green-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
