import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, Heart, MessageCircle, Search, Shield, Wallet, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { FAQS, GLOSSARY, HOW_IT_WORKS } from '@/content/faq';

const VOLT = '#D4FF24';
const COBALT = '#1558C9';
const NIGHT = '#030407';
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' };

const STEP_ICONS = [Search, Calendar, Shield, Heart];
const QUICK_LINKS = [
  { to: '/tutors', label: 'Find a tutor', desc: 'Browse and book a session', icon: Search },
  { to: '/sessions', label: 'My sessions', desc: 'Track and manage bookings', icon: Calendar },
  { to: '/wallet', label: 'My wallet', desc: 'Top up and withdraw', icon: Wallet },
  { to: '/contact', label: 'Contact support', desc: 'We are happy to help', icon: MessageCircle },
];

export function HelpPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const faqs = q ? FAQS.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(q)) : FAQS;
  const glossary = q ? GLOSSARY.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(q)) : GLOSSARY;
  const noResults = q !== '' && faqs.length === 0 && glossary.length === 0;

  return (
    <AppShell title="Help">
      <div className="mb-6">
        <p className="mb-1 text-sm font-semibold" style={{ color: VOLT }}>Support</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Help &amp; how it works</h2>
        <p className="mt-2 max-w-2xl text-white/55">
          The whole flow in one place — so you always know what happens next and why.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help, e.g. refund, escrow, review…"
          aria-label="Search help topics"
          className="h-12 w-full rounded-xl pl-11 pr-11 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
          style={inputStyle}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-white/40 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {noResults ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <Search className="mx-auto h-12 w-12 text-white/20" />
          <p className="mt-4 font-semibold text-white">No help topics match “{query.trim()}”</p>
          <p className="mt-1 text-sm text-white/50">Try another word, or contact support below.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 rounded-xl px-6 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ background: 'rgba(21,88,201,0.3)', border: '1px solid rgba(21,88,201,0.5)', color: 'white' }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Quick links */}
          {!q && (
            <section className="mb-10">
              <h3 className="mb-4 text-lg font-bold text-white">Jump to</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_LINKS.map((link) => (
                  <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5" style={cardStyle}>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: COBALT }}>
                      <link.icon className="h-5 w-5" style={{ color: VOLT }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{link.label}</p>
                      <p className="truncate text-xs text-white/45">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* How it works */}
          {!q && (
            <section className="mb-10">
              <h3 className="mb-4 text-lg font-bold text-white">How TutorUG works</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HOW_IT_WORKS.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? Search;
                  return (
                    <div key={step.num} className="rounded-2xl p-5" style={cardStyle}>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: COBALT }}>
                          <Icon className="h-5 w-5" style={{ color: VOLT }} />
                        </div>
                        <span className="text-4xl font-black" style={{ color: 'rgba(21,88,201,0.3)' }}>{step.num}</span>
                      </div>
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Glossary */}
          {glossary.length > 0 && (
            <section className="mb-10">
              <h3 className="mb-4 text-lg font-bold text-white">Words we use</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {glossary.map((item) => (
                  <div key={item.q} className="rounded-2xl p-4" style={cardStyle}>
                    <p className="text-sm font-bold" style={{ color: VOLT }}>{item.q}</p>
                    <p className="mt-1 text-sm text-white/55">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="mb-10">
              <h3 className="mb-4 text-lg font-bold text-white">
                {q ? 'Matching questions' : 'Frequently asked questions'}
              </h3>
              <div className="flex flex-col gap-3">
                {faqs.map((item) => {
                  const isOpen = open === item.q;
                  return (
                    <div
                      key={item.q}
                      className="overflow-hidden rounded-2xl"
                      style={{ background: 'rgba(21,88,201,0.1)', border: isOpen ? '1px solid rgba(212,255,36,0.35)' : '1px solid rgba(21,88,201,0.3)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : item.q)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="font-bold text-white">{item.q}</span>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform" style={{ color: VOLT, transform: isOpen ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
                      </button>
                      {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 sm:flex-row" style={{ background: 'rgba(21,88,201,0.12)', border: '1px solid rgba(21,88,201,0.3)' }}>
        <p className="text-sm text-white/70">Still stuck? We are happy to help.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
          <MessageCircle className="h-4 w-4" /> Contact support
        </Link>
      </div>
    </AppShell>
  );
}
