import { useEffect, useRef, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Eye, EyeOff, GraduationCap,
  Lock, Mail, Shield, ShieldCheck, Sparkles, Star, User, Wallet,
} from 'lucide-react';
import { PLATFORM_FEE_PERCENT } from '@/app/config';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { toAppError } from '@/utils/apiError';
import { registerSchema } from '@/utils/schemas';
import type { RegisterFormValues } from '@/utils/schemas';
import { asset } from '@/utils/asset';

/* ── Particles ── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const init = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    type P = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; color: string };
    const colors = ['#1558C9', '#D4FF24', '#ffffff'];
    const particles: P[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.45 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => { const cleanup = init(); return cleanup; }, [init]);
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" />;
}

/* ── Left decorative panel ── */
function LeftPanel() {
  return (
    <div className="relative hidden lg:flex flex-col overflow-hidden" style={{ background: '#030407', minHeight: '100vh' }}>
      <div className="absolute inset-0">
        <img src={asset('/img/tutor-teaching.jpg')} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(3,4,7,0.93) 0%, rgba(3,4,7,0.78) 50%, rgba(21,88,201,0.6) 100%)' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="rgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1558C9" strokeWidth="1" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#rgrid)" />
        </svg>
      </div>
      <div className="absolute left-0 top-1/4 h-72 w-72 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(21,88,201,0.2)' }} />
      <div className="absolute right-0 bottom-1/4 h-56 w-56 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(212,255,36,0.07)' }} />
      <Particles />

      <div className="relative z-10 flex flex-col justify-between h-full p-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl shadow-lg" style={{ background: '#D4FF24' }}>
            <GraduationCap className="h-6 w-6" style={{ color: '#030407' }} />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">TutorUG</span>
        </Link>

        <div className="my-auto py-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(21,88,201,0.25)', border: '1px solid rgba(21,88,201,0.4)' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#D4FF24' }} />
            <span className="text-xs font-bold" style={{ color: '#D4FF24' }}>Uganda's #1 peer tutoring platform</span>
          </div>
          <h2 className="text-4xl font-black leading-tight text-white xl:text-5xl">
            Learn from peers.<br />
            <span style={{ color: '#D4FF24' }}>Earn from</span><br />
            what you know.
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-sm">
            Join thousands of Ugandan university students already learning and earning on TutorUG.
          </p>

          <div className="mt-10 flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(3,4,7,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(21,88,201,0.4)' }}>
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl" style={{ background: '#1558C9' }}>
                <span className="text-sm font-black" style={{ color: '#D4FF24' }}>AK</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm">Akello Kizza</p>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(212,255,36,0.15)', color: '#D4FF24' }}>Verified</span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">Calculus I · BSc Yr 3 · Makerere</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="h-3 w-3 fill-current" style={{ color: '#D4FF24' }} />
                  <span className="text-xs font-bold" style={{ color: '#D4FF24' }}>4.9</span>
                  <span className="text-xs text-white/40">· UGX 8,000/session</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(3,4,7,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,255,36,0.2)' }}>
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(212,255,36,0.15)' }}>
                <Shield className="h-5 w-5" style={{ color: '#D4FF24' }} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Free to join</p>
                <p className="text-xs text-white/50 mt-0.5">No subscription · Pay per session only</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: 'rgba(3,4,7,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(21,88,201,0.3)' }}>
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(21,88,201,0.25)' }}>
                <ShieldCheck className="h-5 w-5" style={{ color: '#1558C9' }} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">UGX 8,000 held securely</p>
                <p className="text-xs text-white/50 mt-0.5">MTN MoMo · Protected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-6" style={{ borderTop: '1px solid rgba(21,88,201,0.25)' }}>
          {[['480+', 'Students'], ['120+', 'Tutors'], ['★ 4.8', 'Avg rating']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-lg font-black" style={{ color: '#D4FF24' }}>{val}</p>
              <p className="text-xs text-white/50">{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Password strength bar ── */
function PasswordStrength({ value }: { value: string }) {
  const score = [/.{8,}/, /[A-Za-z]/, /[0-9]/].filter(r => r.test(value)).length;
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['', '#ff6b6b', '#f59e0b', '#D4FF24'];
  if (!value) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }} />
      ))}
      <span className="text-xs font-semibold" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export function RegisterPageNew() {
  const navigate = useNavigate();
  const { register: registerUser, status, user } = useAuth();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'STUDENT', acceptTerms: false },
  });

  const password = watch('password', '');

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate(user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [status, user, navigate]);

  if (status === 'authenticated' && user) return null;

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

  const inputBase = 'h-12 w-full rounded-xl pl-10 pr-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]';
  const inputStyle = (err: boolean) => ({
    background: 'rgba(255,255,255,0.05)',
    border: err ? '1px solid rgba(255,60,60,0.5)' : '1px solid rgba(21,88,201,0.4)',
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ background: '#030407' }}>
      <LeftPanel />

      {/* Right — form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16" style={{ background: '#030407' }}>
        {/* Mobile header */}
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: '#D4FF24' }}>
              <GraduationCap className="h-5 w-5" style={{ color: '#030407' }} />
            </div>
            <span className="font-display text-lg font-extrabold text-white">TutorUG</span>
          </Link>
          <Link to="/" className="text-sm text-white/50 transition hover:text-white">← Home</Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(21,88,201,0.2)', border: '1px solid rgba(21,88,201,0.4)' }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: '#D4FF24' }} />
              <span className="text-xs font-bold" style={{ color: '#D4FF24' }}>Join for free</span>
            </div>
            <h1 className="text-4xl font-black text-white">Create account</h1>
            <p className="mt-2 text-white/55">Uganda's university peer-to-peer learning platform</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-8" style={{ background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.3)' }}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {submitError && (
                <div className="rounded-xl p-4 text-sm font-medium" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff6b6b' }}>
                  {submitError}
                </div>
              )}

              {/* Role toggle */}
              <div>
                <p className="mb-2 text-sm font-semibold text-white/80">I want to…</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'STUDENT', icon: BookOpen, label: 'Find a tutor' },
                    { value: 'TUTOR', icon: Wallet, label: 'Become a tutor' },
                  ] as const).map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setRole(value); setValue('role', value); }}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition"
                      style={{
                        background: role === value ? 'rgba(21,88,201,0.3)' : 'rgba(255,255,255,0.04)',
                        border: role === value ? '1.5px solid #1558C9' : '1.5px solid rgba(255,255,255,0.08)',
                        color: role === value ? 'white' : 'rgba(255,255,255,0.45)',
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px', color: role === value ? '#D4FF24' : undefined }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white/80">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" style={{ width: '18px', height: '18px' }} />
                  <input type="text" placeholder="Enter your full name" autoComplete="name" className={inputBase} style={inputStyle(!!errors.fullName)} {...register('fullName')} />
                </div>
                {errors.fullName && <p className="mt-1.5 text-xs font-medium" style={{ color: '#ff6b6b' }}>{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white/80">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" style={{ width: '18px', height: '18px' }} />
                  <input type="email" placeholder="you@university.ac.ug" autoComplete="email" className={inputBase} style={inputStyle(!!errors.email)} {...register('email')} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium" style={{ color: '#ff6b6b' }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white/80">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" style={{ width: '18px', height: '18px' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" className={`${inputBase} pr-12`} style={inputStyle(!!errors.password)} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
                <PasswordStrength value={password} />
                {errors.password && <p className="mt-1.5 text-xs font-medium" style={{ color: '#ff6b6b' }}>{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white/80">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" style={{ width: '18px', height: '18px' }} />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password" autoComplete="new-password" className={`${inputBase} pr-12`} style={inputStyle(!!errors.confirmPassword)} {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium" style={{ color: '#ff6b6b' }}>{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 rounded accent-[#D4FF24]" {...register('acceptTerms')} />
                <span className="text-xs text-white/50">
                  I agree to the Terms and Privacy Policy. TutorUG keeps a {PLATFORM_FEE_PERCENT}% service fee on tutor earnings.
                </span>
              </label>
              {errors.acceptTerms && <p className="text-xs font-medium" style={{ color: '#ff6b6b' }}>{errors.acceptTerms.message}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl text-base font-bold transition hover:opacity-90 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#D4FF24', color: '#030407' }}
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
                {!isSubmitting && <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />}
              </button>

              {/* Security note */}
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-white/35">
                <ShieldCheck style={{ width: '14px', height: '14px' }} />
                Your data is encrypted and secured
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="font-bold transition hover:opacity-80" style={{ color: '#D4FF24' }}>
              Log in
            </Link>
          </p>
          <p className="mt-3 hidden text-center text-xs text-white/25 lg:block">
            <Link to="/" className="transition hover:text-white/50">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}