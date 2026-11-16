import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, Heart, MessageCircle, Search, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { FAQS, GLOSSARY, HOW_IT_WORKS } from '@/content/faq';

const VOLT = '#D4FF24';
const COBALT = '#1558C9';
const NIGHT = '#030407';
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };

const STEP_ICONS = [Search, Calendar, Shield, Heart];

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppShell title="Help">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: VOLT }}>Support</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Help &amp; how it works</h2>
        <p className="mt-2 max-w-2xl text-white/55">
          The whole flow in one place — so you always know what happens next and why.
        </p>
      </div>

      {/* How it works */}
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

      {/* Glossary */}
      <section className="mb-10">
        <h3 className="mb-4 text-lg font-bold text-white">Words we use</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY.map((item) => (
            <div key={item.q} className="rounded-2xl p-4" style={cardStyle}>
              <p className="text-sm font-bold" style={{ color: VOLT }}>{item.q}</p>
              <p className="mt-1 text-sm text-white/55">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h3 className="mb-4 text-lg font-bold text-white">Frequently asked questions</h3>
        <div className="flex flex-col gap-3">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl"
                style={{ background: 'rgba(21,88,201,0.1)', border: isOpen ? '1px solid rgba(212,255,36,0.35)' : '1px solid rgba(21,88,201,0.3)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
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

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 sm:flex-row" style={{ background: 'rgba(21,88,201,0.12)', border: '1px solid rgba(21,88,201,0.3)' }}>
        <p className="text-sm text-white/70">Still stuck? We are happy to help.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
          <MessageCircle className="h-4 w-4" /> Contact support
        </Link>
      </div>
    </AppShell>
  );
}
