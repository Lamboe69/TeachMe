import { useEffect, useState } from 'react';
import { GraduationCap, Shield, Star, Wallet } from 'lucide-react';

const quotes = [
  { text: "Found the perfect tutor for Calculus in one day. Lifesaver!", uni: "Makerere University" },
  { text: "Earning by helping others while still keeping up with my course load.", uni: "Kyambogo University" },
  { text: "Finally understand Database Systems thanks to a fellow student who explained it so well.", uni: "MUST" },
];

const subjects = ["Calculus", "Database Systems", "Financial Accounting", "Constitutional Law"];

export function BrandStage({ mode = 'login', role = 'learner' }: { mode?: 'login' | 'register'; role?: 'learner' | 'tutor' }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-green-800 via-emerald-800 to-green-900 p-8 lg:p-12">
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="barkcloth" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="#fbbf24" strokeWidth="1"/>
            <circle cx="30" cy="30" r="4" fill="#fbbf24"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#barkcloth)" />
      </svg>
      
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-32 bottom-40 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white shadow-lg">
            <GraduationCap className="h-7 w-7 text-green-700" aria-hidden="true" />
          </div>
          <span className="font-display text-2xl font-extrabold text-white">TutorUG</span>
        </div>
        
        <div className="mt-12">
          <h1 className="text-4xl font-black leading-tight text-white lg:text-5xl">
            {mode === 'login' ? (
              <>Welcome back.<br /><span className="text-amber-400">Your next session is waiting.</span></>
            ) : role === 'tutor' ? (
              <>Teach what you know.<br /><span className="text-amber-400">Earn on your terms.</span></>
            ) : (
              <>Learn from the best<br />in your class.<br /><span className="text-amber-400">Or earn from being one.</span></>
            )}
          </h1>
          <p className="mt-4 text-lg text-white/90">
            {mode === 'login'
              ? 'Pick up right where you left off with your study partners.'
              : role === 'tutor'
              ? 'Turn your course unit expertise into income. Set your rate, teach around your timetable.'
              : 'Find a fellow university student to help you ace your course units.'}
          </p>
        </div>
      </div>

      <div className="relative space-y-6">
        <div className="relative h-64">
          <div className="absolute left-0 top-0 animate-float rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-amber-200">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                SN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink-950">Sarah Namutebi</p>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Verified</span>
                </div>
                <p className="text-xs text-ink-600">Makerere • Calculus I</p>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">4.9</span>
                  <span className="text-xs text-ink-500">• UGX 35,000/session</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute right-0 top-16 animate-float rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-green-200" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-green-100">
                <Shield className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-950">Session confirmed</p>
                <p className="text-xs text-ink-600">Mon 26 Oct • 10:00–11:00</p>
              </div>
            </div>
          </div>
          
          <div className="absolute left-8 bottom-0 animate-float rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-amber-200" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
                <Wallet className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-950">UGX 20,000 held securely</p>
                <p className="text-xs text-ink-600">MTN MoMo • Protected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <span key={s} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30">
              {s}
            </span>
          ))}
        </div>

        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/30">
          <p className="text-sm italic text-white/95">"{quotes[quoteIndex].text}"</p>
          <p className="mt-2 text-xs font-semibold text-amber-300">— Student, {quotes[quoteIndex].uni}</p>
          <p className="mt-1 text-xs text-white/60">Sample content</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span>Payments protected by TutorUG</span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-400" />
            <span>MTN MoMo & Airtel Money</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-amber-400" />
            <span>Verified university students</span>
          </div>
        </div>
      </div>
    </div>
  );
}
