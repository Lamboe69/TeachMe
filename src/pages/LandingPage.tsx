import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight, Calendar, Check, GraduationCap, Heart,
  LayoutDashboard, Menu, Quote, Search, Shield,
  Sparkles, Star, TrendingUp, Wallet, X, XCircle,
} from 'lucide-react';
import { asset } from '@/utils/asset';

/* ── Scroll-fade hook ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return { ref, count };
}

/* ── Particle canvas ── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const init = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    type P = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; color: string };
    const colors = ['#1558C9', '#D4FF24', '#ffffff'];
    const particles: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
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

/* ── Live activity feed ── */
const FEED_ITEMS = [
  { icon: '📚', msg: 'Nakato just booked a Calculus session', time: '2s ago' },
  { icon: '💰', msg: 'Ssemwogerere earned UGX 8,000 from a session', time: '18s ago' },
  { icon: '⭐', msg: 'Apio left a 5-star review', time: '45s ago' },
  { icon: '🎓', msg: 'New tutor joined — Database Systems', time: '1m ago' },
  { icon: '✅', msg: 'Session completed — Organic Chemistry', time: '2m ago' },
  { icon: '📖', msg: 'Ochieng booked a Statistics session', time: '3m ago' },
];

function ActivityFeed() {
  const [items, setItems] = useState([FEED_ITEMS[0]]);
  const [visible, setVisible] = useState(true);
  const idxRef = useRef(1);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = FEED_ITEMS[idxRef.current % FEED_ITEMS.length];
      idxRef.current++;
      setVisible(false);
      setTimeout(() => { setItems([next]); setVisible(true); }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      className="fixed bottom-6 left-6 z-40 hidden lg:block transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
          style={{ background: 'rgba(3,4,7,0.92)', border: '1px solid rgba(21,88,201,0.45)', backdropFilter: 'blur(16px)', maxWidth: '300px' }}
        >
          <span className="text-xl">{item.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-snug">{item.msg}</p>
            <p className="text-xs mt-0.5" style={{ color: '#D4FF24' }}>{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="TutorUG home">
      <div className="grid h-11 w-11 place-items-center rounded-xl shadow-lg" style={{ background: '#D4FF24' }}>
        <GraduationCap className="h-6 w-6" style={{ color: '#030407' }} aria-hidden="true" />
      </div>
      <span className="font-display text-xl font-extrabold tracking-tight text-white">TutorUG</span>
    </Link>
  );
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, status } = useAuth();
  const isSignedIn = status === 'authenticated' && !!user;
  const dashboardPath = user?.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard';
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: scrolled ? 'rgba(3,4,7,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : undefined, borderBottom: scrolled ? '1px solid rgba(21,88,201,0.3)' : undefined }}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />
        <div className="hidden items-center gap-8 lg:flex">
          {['Find tutors','How it works','Become a tutor','FAQ'].map((label, i) => {
            const hrefs = ['/tutors','#how-it-works','#become-tutor','#faq'];
            return i === 0
              ? <Link key={label} to={hrefs[i]} className="text-sm font-semibold text-white/80 transition hover:text-[#D4FF24]">{label}</Link>
              : <a key={label} href={hrefs[i]} className="text-sm font-semibold text-white/80 transition hover:text-[#D4FF24]">{label}</a>;
          })}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {isSignedIn ? (
            <Link to={dashboardPath} className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
              <LayoutDashboard className="h-4 w-4" />Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-[#D4FF24]">Log in</Link>
              <Link to="/register" className="rounded-xl px-6 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>Get started</Link>
            </>
          )}
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="grid h-11 w-11 place-items-center rounded-xl text-white lg:hidden" aria-label="Menu">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden" style={{ background: '#030407' }}>
          <div className="flex h-16 shrink-0 items-center justify-between px-4">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)} className="grid h-11 w-11 place-items-center text-white"><X /></button>
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-6">
            <Link to="/tutors" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-white/80">Find tutors</Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-white/80">How it works</a>
            <a href="#become-tutor" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold text-white/80">Become a tutor</a>
            <div className="mt-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: 'rgba(21,88,201,0.4)' }}>
              {isSignedIn ? (
                <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-6 py-3 text-center font-bold" style={{ background: '#D4FF24', color: '#030407' }}>Go to dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-center font-semibold text-white/80">Log in</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-6 py-3 text-center font-bold" style={{ background: '#D4FF24', color: '#030407' }}>Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0">
        <img src={asset('/img/university-campus.jpg')} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(3,4,7,0.93) 0%, rgba(3,4,7,0.80) 50%, rgba(21,88,201,0.55) 100%)' }} />
      </div>
      {/* Particles */}
      <Particles />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1558C9" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute left-0 top-40 h-[400px] w-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(21,88,201,0.18)' }} />
      <div className="absolute right-0 bottom-20 h-[300px] w-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(212,255,36,0.06)' }} />
      <div ref={ref} className="container-page relative transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-center sm:px-5 sm:py-2" style={{ background: 'rgba(21,88,201,0.2)', border: '1px solid rgba(21,88,201,0.4)' }}>
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: '#D4FF24' }} />
              <span className="text-xs font-bold leading-snug sm:text-sm" style={{ color: '#D4FF24' }}>Peer-to-Peer for University Students in Uganda</span>
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl text-white">
              Ace your{' '}
              <span className="relative inline-block">
                <span style={{ color: '#D4FF24' }}>course units</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 280 14" fill="none">
                  <path d="M3 11C70 4 210 4 277 11" stroke="#1558C9" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
              <br />with a fellow student
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:mt-6 sm:text-xl">
              TutorUG connects university students to help each other succeed. Learn from someone who aced it, or earn by teaching what you know. All payments secured by MTN & Airtel Money.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row">
              <Link to="/tutors" className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-base font-bold shadow-xl transition hover:opacity-90 hover:scale-105 sm:px-8 sm:py-4 sm:text-lg" style={{ background: '#D4FF24', color: '#030407' }}>
                Find a tutor <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <a href="#become-tutor" className="inline-flex items-center justify-center gap-3 rounded-xl border-2 px-6 py-3.5 text-base font-bold transition hover:scale-105 sm:px-8 sm:py-4 sm:text-lg" style={{ borderColor: '#1558C9', color: 'white', background: 'rgba(21,88,201,0.15)' }}>
                Start earning <Wallet className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4 rounded-2xl p-4" style={{ background: 'rgba(21,88,201,0.15)', border: '1px solid rgba(21,88,201,0.3)' }}>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 rounded-full ring-2 ring-[#030407]" style={{ background: '#1558C9' }} />)}
              </div>
              <div>
                <p className="font-bold text-white">Students across Uganda</p>
                <p className="text-sm" style={{ color: '#D4FF24' }}>Learning & earning together</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ border: '1px solid rgba(21,88,201,0.4)' }}>
              <img src={asset('/img/tutor-teaching.jpg')} alt="A student tutor explaining a concept" className="h-full w-full object-cover" style={{ minHeight: '420px' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,7,0.85) 0%, rgba(3,4,7,0.2) 60%, transparent 100%)' }} />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl px-5 py-4" style={{ background: 'rgba(3,4,7,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(21,88,201,0.4)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">UGX 5,000 – 15,000 / session</p>
                    <p className="text-xs text-white/50">Held in escrow until complete</p>
                  </div>
                  <div className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: '#D4FF24', color: '#030407' }}>Book now</div>
                </div>
              </div>
            </div>
            <div className="animate-float absolute right-2 top-10 rounded-2xl px-4 py-3 shadow-2xl" style={{ background: '#0f1629', border: '1px solid rgba(21,88,201,0.5)' }}>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" style={{ color: '#D4FF24' }} />
                <div>
                  <p className="font-bold text-white text-sm">Escrow Protected</p>
                  <p className="text-xs text-white/50">MTN MoMo & Airtel Money</p>
                </div>
              </div>
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded-2xl px-4 py-3 shadow-2xl" style={{ background: '#0f1629', border: '1px solid rgba(212,255,36,0.3)' }}>
              <p className="text-xl font-black" style={{ color: '#D4FF24' }}>★ 4.9</p>
              <p className="text-xs text-white/50">Avg tutor rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Subject marquee ── */
const SUBJECTS = ['Calculus','Data Structures','Organic Chemistry','Microeconomics','Linear Algebra','Database Systems','Thermodynamics','Statistics','Business Law','Anatomy','Operating Systems','Accounting','Fluid Mechanics','Pharmacology','Computer Networks','Genetics'];
function Marquee() {
  const items = [...SUBJECTS, ...SUBJECTS];
  return (
    <div className="overflow-hidden py-5" style={{ background: '#1558C9', borderTop: '1px solid rgba(212,255,36,0.15)', borderBottom: '1px solid rgba(212,255,36,0.15)' }}>
      <div className="flex gap-6 whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite', width: 'max-content' }}>
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: i % 3 === 0 ? '#D4FF24' : 'rgba(255,255,255,0.85)' }}>
            <span style={{ color: '#D4FF24', opacity: 0.5 }}>✦</span>{s}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ── Stats bar ── */
function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, count } = useCounter(target);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-4xl font-black sm:text-5xl" style={{ color: '#D4FF24' }}>{count.toLocaleString()}{suffix}</span>
      <span className="text-sm font-semibold text-white/60">{label}</span>
    </div>
  );
}
function StatsBar() {
  const { ref, visible } = useFadeIn();
  return (
    <section ref={ref} className="py-14 transition-all duration-700" style={{ background: '#030407', borderBottom: '1px solid rgba(21,88,201,0.25)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}>
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatItem target={480} suffix="+" label="Active students" />
          <StatItem target={120} suffix="+" label="Verified tutors" />
          <StatItem target={890} suffix="+" label="Sessions completed" />
          <StatItem target={48} suffix="" label="Avg rating ★ 4.8" />
        </div>
      </div>
    </section>
  );
}

/* ── Universities strip ── */
const UNIVERSITIES = ['Makerere University','Kyambogo University','Uganda Christian University','Mbarara University','Gulu University','MUST','Nkumba University','Busitema University','Kabale University','MUBS'];
function UniversitiesStrip() {
  const { ref, visible } = useFadeIn();
  const items = [...UNIVERSITIES, ...UNIVERSITIES];
  return (
    <section ref={ref} className="py-10 transition-all duration-700" style={{ background: 'rgba(21,88,201,0.06)', borderTop: '1px solid rgba(21,88,201,0.2)', borderBottom: '1px solid rgba(21,88,201,0.2)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
      <div className="container-page mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Trusted by students from</p>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {items.map((u, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 text-sm font-bold text-white/50 transition hover:text-white/80">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? '#D4FF24' : '#1558C9' }} />{u}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
function HowItWorks() {
  const { ref, visible } = useFadeIn();
  const steps = [
    { num: '01', title: 'Find a tutor', desc: 'Browse university students by course unit, see their rate and reviews.', icon: Search },
    { num: '02', title: 'Book & agree', desc: 'Pick your time, explain what you need help with, send request.', icon: Calendar },
    { num: '03', title: 'Pay securely', desc: 'Pay via MTN MoMo/Airtel Money. Money held by TutorUG until done.', icon: Shield },
    { num: '04', title: 'Learn & review', desc: 'Have your session, mark complete, leave review. Tutor gets paid.', icon: Heart },
  ];
  return (
    <section id="how-it-works" className="py-20 sm:py-24 lg:py-32" style={{ background: '#030407' }}>
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white">
            How it{' '}
            <span className="relative inline-block">
              <span style={{ color: '#D4FF24' }}>works</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 130 12" fill="none">
                <path d="M3 10C32 4 98 4 127 10" stroke="#1558C9" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="mt-4 text-xl text-white/60">Four simple steps to start learning</p>
        </div>
        <div ref={ref} className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 sm:p-8"
              style={{ background: 'rgba(21,88,201,0.12)', border: '1px solid rgba(21,88,201,0.35)', transitionDelay: `${idx * 80}ms` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px rgba(21,88,201,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="grid h-16 w-16 place-items-center rounded-2xl shadow-lg" style={{ background: '#1558C9' }}>
                  <step.icon className="h-8 w-8" style={{ color: '#D4FF24' }} />
                </div>
                <span className="text-6xl font-black" style={{ color: 'rgba(21,88,201,0.25)' }}>{step.num}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-white/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Before / After ── */
function BeforeAfter() {
  const { ref, visible } = useFadeIn();
  const before = [
    'Studying alone with no guidance',
    'Expensive private tutors (UGX 80k+)',
    'Lecturers too busy to explain again',
    'Failing exams, repeating course units',
    'No one who understands your syllabus',
  ];
  const after = [
    'Learn from a student who aced it',
    'Affordable sessions from UGX 5,000',
    'Peer who explains it the right way',
    'Pass with confidence, move forward',
    'Tutor who sat the exact same exam',
  ];
  return (
    <section className="py-20 sm:py-24" style={{ background: '#030407' }}>
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
            Life <span style={{ color: '#D4FF24' }}>before</span> vs{' '}
            <span style={{ color: '#1558C9' }}>after</span> TutorUG
          </h2>
          <p className="mt-4 text-lg text-white/60">The difference is real</p>
        </div>
        <div
          ref={ref}
          className="grid gap-6 md:grid-cols-2 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          {/* Before */}
          <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,60,60,0.2)' }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'rgba(255,60,60,0.15)' }}>
                <XCircle className="h-6 w-6" style={{ color: '#ff4444' }} />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Without TutorUG</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {before.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(255,60,60,0.2)' }}>
                    <X className="h-3 w-3" style={{ color: '#ff4444' }} />
                  </span>
                  <span className="text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* After */}
          <div className="rounded-3xl p-6 sm:p-8" style={{ background: 'rgba(21,88,201,0.1)', border: '1px solid rgba(212,255,36,0.25)' }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'rgba(212,255,36,0.15)' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#D4FF24' }} />
              </div>
              <h3 className="text-2xl font-extrabold text-white">With TutorUG</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {after.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(212,255,36,0.2)' }}>
                    <Check className="h-3 w-3" style={{ color: '#D4FF24' }} />
                  </span>
                  <span className="text-white/85">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: '#D4FF24', color: '#030407' }}
            >
              Join for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Editorial image break ── */
function EditorialBreak() {
  const { ref, visible } = useFadeIn();
  return (
    <section
      ref={ref}
      className="relative overflow-hidden transition-all duration-700"
      style={{ minHeight: '380px', opacity: visible ? 1 : 0 }}
    >
      <img
        src={asset('/img/students-learning.jpg')}
        alt="Students learning together"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(3,4,7,0.92) 0%, rgba(3,4,7,0.6) 50%, rgba(21,88,201,0.5) 100%)' }}
      />
      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0 60 C360 0 1080 0 1440 60 L1440 0 L0 0 Z" fill="#030407"/>
        </svg>
      </div>
      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0 0 C360 60 1080 60 1440 0 L1440 60 L0 60 Z" fill="#030407"/>
        </svg>
      </div>
      <div className="container-page relative flex min-h-[380px] items-center py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4FF24' }}>
            The TutorUG difference
          </p>
          <blockquote className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            "The best person to explain a course unit is someone who just passed it."
          </blockquote>
          <p className="mt-6 text-lg text-white/60">
            That's the idea behind TutorUG — peer knowledge, delivered affordably, paid securely.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'rgba(212,255,36,0.3)' }} />
            <span className="text-sm font-bold" style={{ color: '#D4FF24' }}>TutorUG · Uganda</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Featured tutors ── */
const FEATURED_TUTORS = [
  { name: 'Victor Tumwine', uni: 'Makerere · BSc Yr 4', subject: 'Calculus & Linear Algebra', rating: 4.9, sessions: 47, price: 10000, photo: asset('/img/tutor-1.jpg') },
  { name: 'Grace Namukasa', uni: 'Kyambogo · BIT Yr 3', subject: 'Database Systems', rating: 4.8, sessions: 31, price: 8000, photo: asset('/img/tutor-2.jpg') },
  { name: 'David Okello', uni: 'UCU · BSc Yr 4', subject: 'Organic Chemistry', rating: 5.0, sessions: 22, price: 12000, photo: asset('/img/tutor-3.jpg') },
];

function FeaturedTutors() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-20 sm:py-24" style={{ background: '#030407' }}>
      <div className="container-page">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#1558C9' }}>Top rated this semester</p>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Meet your <span style={{ color: '#D4FF24' }}>tutors</span>
            </h2>
          </div>
          <Link to="/tutors" className="hidden sm:inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/5" style={{ borderColor: 'rgba(21,88,201,0.5)' }}>
            View all tutors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div ref={ref} className="grid gap-6 md:grid-cols-3 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>
          {FEATURED_TUTORS.map((t, i) => (
            <div key={i} className="group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{ background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.3)', transitionDelay: `${i * 80}ms` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(21,88,201,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div className="relative h-52 overflow-hidden">
                <img src={t.photo} alt={t.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,7,0.7) 0%, transparent 60%)' }} />
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'rgba(3,4,7,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,255,36,0.3)' }}>
                  <Star className="h-3.5 w-3.5 fill-current" style={{ color: '#D4FF24' }} />
                  <span className="text-xs font-bold" style={{ color: '#D4FF24' }}>{t.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-lg font-extrabold text-white">{t.name}</p>
                <p className="text-xs text-white/50 mt-0.5">{t.uni}</p>
                <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(21,88,201,0.25)', color: '#D4FF24' }}>{t.subject}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black text-white">UGX {t.price.toLocaleString()}</p>
                    <p className="text-xs text-white/40">per session · {t.sessions} done</p>
                  </div>
                  <Link to="/tutors" className="rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>Book</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/tutors" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold text-white" style={{ borderColor: 'rgba(21,88,201,0.5)' }}>
            View all tutors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name: 'Nakato Aisha', uni: 'Makerere University · BBA Yr 2', subject: 'Calculus', rating: 5, photo: asset('/img/student-aisha.jpg'), text: "I was failing Calculus and couldn't afford a private tutor. On TutorUG I found a Makerere Yr 4 student who sat the same MAT 1101 exam. Three sessions at UGX 8,000 each and I passed. Best money I ever spent." },
  { name: 'Ssemwogerere Brian', uni: 'Kyambogo University · BIT Yr 3', subject: 'Database Systems', rating: 5, photo: asset('/img/student-brian.jpg'), text: "I tutor Database Systems on Saturday mornings between 9 and 11. I've earned UGX 120,000 this semester — enough to cover my retake fees and buy data. The MoMo payment lands the same day the session ends." },
  { name: 'Akello Patience', uni: 'UCU · BSc Nursing Yr 2', subject: 'Organic Chemistry', rating: 5, photo: asset('/img/student-patience.jpg'), text: "CHE 1201 was going to make me repeat the year. My TutorUG tutor had done the same course at UCU the year before — she knew exactly which questions Ssekandi sets. Two sessions and I was sorted." },
];

function Testimonials() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-20 sm:py-24" style={{ background: '#030407' }}>
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl text-white">
            Real students, <span style={{ color: '#D4FF24' }}>real results</span>
          </h2>
          <p className="mt-4 text-lg text-white/60">From students and tutors across Uganda</p>
        </div>
        <div ref={ref} className="mt-14 grid gap-6 md:grid-cols-3 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(21,88,201,0.1)', border: '1px solid rgba(21,88,201,0.3)', transitionDelay: `${i * 100}ms` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 36px rgba(212,255,36,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div className="mb-5 h-36 overflow-hidden rounded-2xl">
                <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
              </div>
              <Quote className="mb-4 h-8 w-8 opacity-30" style={{ color: '#D4FF24' }} />
              <p className="flex-1 text-base leading-relaxed text-white/80">"{t.text}"</p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.uni}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" style={{ color: '#D4FF24' }} />)}
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(21,88,201,0.3)', color: '#D4FF24' }}>{t.subject}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Become a tutor ── */
function BecomeTutor() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="become-tutor" className="py-20 sm:py-24" style={{ background: '#1558C9' }}>
      <div className="container-page">
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-2 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(212,255,36,0.15)' }}>
              <Sparkles className="h-4 w-4" style={{ color: '#D4FF24' }} />
              <span className="text-sm font-bold" style={{ color: '#D4FF24' }}>For students who know their stuff</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Turn your knowledge<br />into <span style={{ color: '#D4FF24' }}>income</span>
            </h2>
            <p className="mt-6 text-xl text-white/80">
              If you've aced a course unit, you can help others and earn money doing it. Set your own rate, choose your schedule, get paid via mobile money.
            </p>
            <Link to="/register?role=TUTOR" className="mt-8 inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition hover:opacity-90 hover:scale-105" style={{ background: '#D4FF24', color: '#030407' }}>
              Become a tutor <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ minHeight: '380px', border: '1px solid rgba(212,255,36,0.2)' }}>
            <img src={asset('/img/library-study.jpg')} alt="Students studying in a university library" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,7,0.9) 0%, rgba(3,4,7,0.3) 60%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-3 p-6">
              {[
                { label: 'Set your rate', desc: 'You decide what you charge' },
                { label: 'Flexible schedule', desc: 'Teach on your timetable' },
                { label: 'Mobile money', desc: 'MTN MoMo or Airtel Money' },
                { label: 'Build reputation', desc: 'Reviews attract more students' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(3,4,7,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,255,36,0.15)' }}>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-20 sm:py-24" style={{ background: '#030407' }}>
      <div className="container-page">
        <div ref={ref} className="relative overflow-hidden rounded-[2rem] px-8 py-16 text-center shadow-2xl sm:px-16 sm:py-20 transition-all duration-700"
          style={{ background: 'linear-gradient(135deg, #1558C9 0%, #0d3a8a 100%)', border: '1px solid rgba(212,255,36,0.2)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#D4FF24"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <div className="relative">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">Ready to learn or earn?</h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-white/80">Join Uganda's university peer-to-peer community. Students helping students succeed.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/tutors" className="inline-flex items-center gap-3 rounded-xl px-10 py-4 text-lg font-bold transition hover:opacity-90 hover:scale-105" style={{ background: '#D4FF24', color: '#030407' }}>
                Find a tutor <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/register?role=TUTOR" className="inline-flex items-center gap-3 rounded-xl border-2 px-10 py-4 text-lg font-bold text-white transition hover:bg-white/10" style={{ borderColor: 'rgba(212,255,36,0.5)' }}>
                Start earning <Wallet className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const { user, status } = useAuth();
  const isSignedIn = status === 'authenticated' && !!user;
  const dashboardPath = user?.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard';
  return (
    <footer style={{ background: '#030407', borderTop: '1px solid rgba(21,88,201,0.25)' }}>
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="text-sm leading-relaxed text-white/55 max-w-xs">Uganda's peer-to-peer tutoring marketplace. Any student can teach. Any student can learn.</p>
            <div className="flex gap-3">
              <span className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: 'rgba(21,88,201,0.2)', color: '#D4FF24', border: '1px solid rgba(21,88,201,0.35)' }}>MTN MoMo</span>
              <span className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: 'rgba(21,88,201,0.2)', color: '#D4FF24', border: '1px solid rgba(21,88,201,0.35)' }}>Airtel Money</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4FF24' }}>Platform</p>
              <ul className="flex flex-col gap-3">
                <li><Link to="/tutors" className="text-sm text-white/55 transition hover:text-white">Find tutors</Link></li>
                <li><a href="#how-it-works" className="text-sm text-white/55 transition hover:text-white">How it works</a></li>
                <li><a href="#become-tutor" className="text-sm text-white/55 transition hover:text-white">Become a tutor</a></li>
                <li><Link to="/tutors" className="text-sm text-white/55 transition hover:text-white">Browse subjects</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#D4FF24' }}>Account</p>
              <ul className="flex flex-col gap-3">
                <li><Link to={isSignedIn ? dashboardPath : '/login'} className="text-sm text-white/55 transition hover:text-white">{isSignedIn ? 'Dashboard' : 'Log in'}</Link></li>
                <li><Link to="/register" className="text-sm text-white/55 transition hover:text-white">Sign up</Link></li>
                <li><Link to="/register?role=TUTOR" className="text-sm text-white/55 transition hover:text-white">Tutor sign up</Link></li>
                <li><Link to="/forgot-password" className="text-sm text-white/55 transition hover:text-white">Forgot password</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-5 rounded-2xl p-6" style={{ background: 'rgba(21,88,201,0.12)', border: '1px solid rgba(21,88,201,0.3)' }}>
            <p className="text-lg font-extrabold text-white">Start learning today</p>
            <p className="text-sm text-white/55">Find a fellow student who aced your course unit and book a session in minutes.</p>
            <Link to="/tutors" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
              Find a tutor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register?role=TUTOR" className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-white transition hover:bg-white/5" style={{ borderColor: 'rgba(21,88,201,0.5)' }}>
              Become a tutor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-white/35">© 2026 TutorUG. Built for Ugandan university students.</p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: '#D4FF24' }} />
            <span className="text-xs font-semibold" style={{ color: '#D4FF24' }}>Escrow-protected payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#030407' }}>
      <ActivityFeed />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <StatsBar />
        <UniversitiesStrip />
        <HowItWorks />
        <BeforeAfter />
        <EditorialBreak />
        <FeaturedTutors />
        <Testimonials />
        <BecomeTutor />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}