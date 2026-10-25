import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  GraduationCap,
  Heart,
  Menu,
  Search,
  Shield,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="TutorUG home">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
        <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink-950">
        TutorUG
      </span>
    </Link>
  );
}

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />
        <div className="hidden items-center gap-8 lg:flex">
          <Link to="/tutors" className="text-sm font-semibold text-ink-700 transition hover:text-green-700">Find tutors</Link>
          <a href="#how-it-works" className="text-sm font-semibold text-ink-700 transition hover:text-green-700">How it works</a>
          <a href="#become-tutor" className="text-sm font-semibold text-ink-700 transition hover:text-green-700">Become a tutor</a>
          <a href="#faq" className="text-sm font-semibold text-ink-700 transition hover:text-green-700">FAQ</a>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-ink-700 transition hover:text-green-700">Log in</Link>
          <Link to="/register" className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-105">Get started</Link>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="grid h-11 w-11 place-items-center rounded-xl text-ink-700 lg:hidden" aria-label="Menu">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)} className="grid h-11 w-11 place-items-center"><X /></button>
          </div>
          <div className="flex flex-col gap-2 px-4 py-6">
            <Link to="/tutors" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold">Find tutors</Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold">How it works</a>
            <a href="#become-tutor" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 font-semibold">Become a tutor</a>
            <div className="mt-4 flex flex-col gap-3 border-t pt-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-center font-semibold">Log in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-center font-bold text-white">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0">
        <svg className="absolute h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#16a34a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute -left-40 top-40 h-[500px] w-[500px] rounded-full bg-green-300/20 blur-[120px]" />
      <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-amber-300/20 blur-[120px]" />
      
      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-100 to-amber-100 px-5 py-2 ring-1 ring-green-300/50">
              <Sparkles className="h-4 w-4 text-green-700" />
              <span className="text-sm font-bold text-green-900">Peer-to-Peer for University Students in Uganda</span>
            </div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Ace your{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">course units</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 280 14" fill="none">
                  <path d="M3 11C70 4 210 4 277 11" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
              <br />with a fellow student
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink-700">
              TutorUG connects university students to help each other succeed. Learn from someone who aced it, or earn by teaching what you know. All payments secured by MTN & Airtel Money.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/tutors" className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:shadow-2xl hover:scale-105">
                Find a tutor
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <a href="#become-tutor" className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-green-300 bg-white px-8 py-4 text-lg font-bold text-green-700 shadow-lg transition hover:border-green-400 hover:bg-green-50 hover:shadow-xl">
                Start earning
                <Wallet className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-green-200">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 ring-2 ring-white" />
                ))}
              </div>
              <div>
                <p className="font-bold text-ink-950">Students across Uganda</p>
                <p className="text-sm text-ink-600">Learning & earning together</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <svg viewBox="0 0 500 600" className="w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#f0fdf4'}} />
                    <stop offset="100%" style={{stopColor:'#ecfdf5'}} />
                  </linearGradient>
                </defs>
                <rect width="500" height="600" fill="url(#g1)"/>
                <g transform="translate(50, 80)">
                  <rect width="400" height="100" rx="20" fill="white" filter="drop-shadow(0 20px 40px rgb(0 0 0 / 0.1))"/>
                  <circle cx="50" cy="50" r="30" fill="#16a34a"/>
                  <text x="50" y="58" fontSize="20" fontWeight="800" fill="white" textAnchor="middle">SN</text>
                  <text x="100" y="38" fontFamily="Bricolage Grotesque" fontSize="22" fontWeight="800" fill="#111827">Sarah Namutebi</text>
                  <text x="100" y="62" fontSize="13" fill="#6b7280">Verified • Makerere University</text>
                  <rect x="320" y="35" width="60" height="30" rx="15" fill="#dcfce7"/>
                  <text x="350" y="54" fontSize="13" fontWeight="700" fill="#166534" textAnchor="middle">★ 4.9</text>
                </g>
                <g transform="translate(50, 210)">
                  <rect width="400" height="70" rx="16" fill="white"/>
                  <rect x="20" y="23" width="85" height="28" rx="14" fill="#dcfce7"/>
                  <text x="62.5" y="41" fontSize="12" fontWeight="700" fill="#166534" textAnchor="middle">Calculus</text>
                  <rect x="115" y="23" width="140" height="28" rx="14" fill="#fef3c7"/>
                  <text x="185" y="41" fontSize="12" fontWeight="700" fill="#92400e" textAnchor="middle">Database Systems</text>
                  <rect x="265" y="23" width="115" height="28" rx="14" fill="#d1fae5"/>
                  <text x="322.5" y="41" fontSize="12" fontWeight="700" fill="#065f46" textAnchor="middle">Statistics</text>
                </g>
                <g transform="translate(50, 310)">
                  <rect width="400" height="120" rx="20" fill="white" filter="drop-shadow(0 20px 40px rgb(0 0 0 / 0.1))"/>
                  <text x="30" y="35" fontSize="13" fontWeight="600" fill="#6b7280">Per session</text>
                  <text x="30" y="75" fontFamily="Bricolage Grotesque" fontSize="36" fontWeight="900" fill="#111827">UGX 35,000</text>
                  <rect x="260" y="45" width="110" height="42" rx="12" fill="#16a34a"/>
                  <text x="315" y="71" fontSize="15" fontWeight="700" fill="white" textAnchor="middle">Book session</text>
                </g>
                <g transform="translate(50, 460)">
                  <rect width="400" height="70" rx="16" fill="white"/>
                  <circle cx="40" cy="35" r="20" fill="#dcfce7"/>
                  <path d="M32 35l6 6 12-12" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="75" y="30" fontSize="15" fontWeight="800" fill="#111827">Payment secured</text>
                  <text x="75" y="50" fontSize="12" fill="#6b7280">Held by TutorUG until session complete</text>
                </g>
              </svg>
            </div>
            <div className="animate-float absolute -right-8 top-20 rounded-2xl bg-white px-6 py-4 shadow-2xl ring-1 ring-amber-200">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-bold text-ink-950">Escrow Protected</p>
                  <p className="text-xs text-ink-600">MTN MoMo & Airtel Money</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Find a tutor", desc: "Browse university students by course unit, see their rate and reviews.", icon: Search, color: "green" },
    { num: "02", title: "Book & agree", desc: "Pick your time, explain what you need help with, send request.", icon: Calendar, color: "amber" },
    { num: "03", title: "Pay securely", desc: "Pay via MTN MoMo/Airtel Money. Money held by TutorUG until done.", icon: Shield, color: "green" },
    { num: "04", title: "Learn & review", desc: "Have your session, mark complete, leave review. Tutor gets paid.", icon: Heart, color: "amber" },
  ];

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            How it{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">works</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 130 12" fill="none">
                <path d="M3 10C32 4 98 4 127 10" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="mt-4 text-xl text-ink-700">Four simple steps to start learning</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-green-50/30 p-8 shadow-xl ring-1 ring-green-200 transition hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div className={`grid h-16 w-16 place-items-center rounded-2xl ${step.color === 'green' ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-yellow-500'} shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <span className="text-6xl font-black text-green-100">{step.num}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-ink-950">{step.title}</h3>
              <p className="mt-3 text-ink-700 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 px-8 py-16 text-center shadow-2xl sm:px-16 sm:py-20">
          <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.5" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <div className="relative">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to learn or earn?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-white/90">
              Join Uganda's university peer-to-peer community. Students helping students succeed.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/tutors" className="inline-flex items-center gap-3 rounded-xl bg-white px-10 py-4 text-lg font-bold text-green-700 shadow-xl transition hover:shadow-2xl hover:scale-105">
                Find a tutor
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/register?role=TUTOR" className="inline-flex items-center gap-3 rounded-xl border-2 border-white px-10 py-4 text-lg font-bold text-white transition hover:bg-white/10">
                Start earning
                <Wallet className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-green-200 bg-white">
      <div className="container-page py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <p className="max-w-md text-ink-700">Uganda's peer-to-peer tutoring marketplace for university and tertiary students.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
            <Link to="/tutors" className="text-ink-700 hover:text-green-700">Find tutors</Link>
            <a href="#how-it-works" className="text-ink-700 hover:text-green-700">How it works</a>
            <a href="#become-tutor" className="text-ink-700 hover:text-green-700">Become a tutor</a>
            <Link to="/login" className="text-ink-700 hover:text-green-700">Log in</Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 ring-1 ring-green-200">MTN MoMo</span>
            <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 ring-1 ring-green-200">Airtel Money</span>
          </div>
          <p className="text-sm text-ink-600">© 2026 TutorUG. Built for Ugandan university students.</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
