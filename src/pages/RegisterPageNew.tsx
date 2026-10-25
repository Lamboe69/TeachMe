import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mail, Phone, User, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { toAppError } from '@/utils/apiError';
import { registerSchema } from '@/utils/schemas';
import type { RegisterFormValues } from '@/utils/schemas';
import { BrandStage } from '@/components/auth/BrandStage';
import { Stepper } from '@/components/auth/Stepper';
import { RoleCard } from '@/components/auth/RoleCard';
import { PasswordField } from '@/components/forms/PasswordField';

const steps = ["Who are you?", "Your account", "Your studies", "Finish up"];

const universities = ["Makerere University", "Kyambogo University", "MUST", "UCU", "Gulu University", "Other"];

export function RegisterPageNew() {
  const navigate = useNavigate();
  const { register: registerUser, status, user } = useAuth();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [role, setRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  if (status === 'authenticated' && user) {
    navigate(user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    return null;
  }

  const nextStep = () => {
    if (currentStep === 0) {
      setValue('role', role);
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await registerUser(values);
      toast.success('Account created successfully!');
      navigate(values.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message);
    }
  });

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:block">
        <BrandStage mode="register" role={role === 'TUTOR' ? 'tutor' : 'learner'} />
      </div>
      
      <div className="flex min-h-screen flex-col bg-[#fefdfb]">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 transition hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link to="/login" className="text-sm font-semibold text-green-700 transition hover:underline">
            Already have an account? Log in
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
            <p className="mt-3 text-sm text-white/90">Learn from the best in your class. Or earn from being one.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[440px]">
            <div className="mb-6">
              <h1 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">Create account</h1>
              <p className="mt-2 text-ink-700">Join Uganda's university peer-to-peer learning platform</p>
            </div>

            <Stepper steps={steps} currentStep={currentStep} />

            <form onSubmit={onSubmit} noValidate className="space-y-6">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {submitError}
                </div>
              )}

              {currentStep === 0 && (
                <div className="space-y-4">
                  <RoleCard
                    selected={role === 'STUDENT'}
                    onClick={() => setRole('STUDENT')}
                    icon={BookOpen}
                    title="I need help"
                    description="Find tutors and book sessions for course units you need help with"
                  />
                  <RoleCard
                    selected={role === 'TUTOR'}
                    onClick={() => setRole('TUTOR')}
                    icon={Wallet}
                    title="I want to earn"
                    description="Teach course units you've mastered and earn from your knowledge"
                  />
                  <button
                    type="button"
                    onClick={nextStep}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-base font-bold text-white shadow-lg transition hover:shadow-xl"
                  >
                    Continue
                  </button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">Full name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="h-12 w-full rounded-xl border border-ink-300 pl-10 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                        {...register('fullName')}
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                      <input
                        type="email"
                        placeholder="you@university.ac.ug"
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-ink-300 pl-10 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">Phone number (Mobile Money)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                      <input
                        type="tel"
                        placeholder="+256 7XX XXX XXX"
                        className="h-12 w-full rounded-xl border border-ink-300 pl-10 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  <PasswordField label="Password" placeholder="Create a password" register={register('password')} showStrength value={password} />
                  <PasswordField label="Confirm password" placeholder="Confirm your password" register={register('confirmPassword')} value={confirmPassword} />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep} className="h-12 flex-1 rounded-xl border-2 border-ink-300 font-bold text-ink-700">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="h-12 flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-white">
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">University</label>
                    <select className="h-12 w-full rounded-xl border border-ink-300 px-3 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100">
                      <option>Select university</option>
                      {universities.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">Course/Programme</label>
                    <input type="text" placeholder="e.g. Bachelor of Science in Computer Science" className="h-12 w-full rounded-xl border border-ink-300 px-3 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-900">Year of study</label>
                    <div className="flex flex-wrap gap-2">
                      {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5+'].map((y) => (
                        <button key={y} type="button" className="rounded-full border-2 border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-green-300 hover:bg-green-50">
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep} className="h-12 flex-1 rounded-xl border-2 border-ink-300 font-bold text-ink-700">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="h-12 flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-white">
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-900">
                      {role === 'TUTOR' ? "Almost there! Set up your teaching profile" : "Almost there! Welcome to TutorUG"}
                    </p>
                    {role === 'TUTOR' && (
                      <p className="mt-1 text-sm text-green-800">We'll verify your student status before your profile goes live</p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border-2 border-ink-200 p-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-ink-300 text-green-600 focus:ring-green-500"
                      {...register('acceptTerms')}
                    />
                    <span className="text-sm text-ink-700">
                      I agree to the Terms and Privacy Policy. I understand that all payments go through TutorUG, which keeps a [X]% service fee on tutor earnings.
                    </span>
                  </label>
                  {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep} className="h-12 flex-1 rounded-xl border-2 border-ink-300 font-bold text-ink-700">
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-white shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create my account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
