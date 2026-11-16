import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, BookOpen, Clock, Mail, MessageCircle,
  ShieldCheck, Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SUPPORT_EMAIL } from '@/content/legal';

const TOPICS = [
  {
    icon: Wallet,
    title: 'Payments & wallet',
    body: 'Top-ups, withdrawals, escrow and refunds.',
    to: '/refund-policy',
    cta: 'Read the refund policy',
  },
  {
    icon: BookOpen,
    title: 'Bookings & sessions',
    body: 'How to find a tutor, request a session and what happens next.',
    to: '/#faq',
    cta: 'Read the FAQ',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & trust',
    body: 'How escrow protects you and how we handle problems.',
    to: '/terms',
    cta: 'Read the terms',
  },
];

export function ContactPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-[#D4FF24]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(21,88,201,0.2)] text-[#D4FF24]">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Help &amp; support
            </h1>
            <p className="mt-2 text-white/60">
              We are a small team supporting students across Uganda. Reach us by email and we will
              get back to you.
            </p>
          </div>
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1558C9] text-white">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/50">Email support</p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-lg font-bold text-white transition hover:text-[#D4FF24]"
                >
                  {SUPPORT_EMAIL}
                </a>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  We usually reply within 1–2 working days.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D4FF24] px-5 py-3 text-sm font-bold text-[#030407] transition hover:opacity-90"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email us
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] p-4 text-sm text-white/75">
            <p className="flex items-center gap-2 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />
              To help us help you faster
            </p>
            <p className="mt-1.5">
              Include your account email and, if your question is about a booking or payment, the
              session date and the tutor&apos;s name. Never send your password or mobile-money PIN.
            </p>
          </div>
        </Card>

        <h2 className="mt-10 text-lg font-bold text-white">Common topics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TOPICS.map((topic) => (
            <Card key={topic.title} className="flex flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(21,88,201,0.2)] text-[#D4FF24]">
                <topic.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-bold text-white">{topic.title}</p>
              <p className="mt-1 flex-1 text-sm text-white/60">{topic.body}</p>
              <Link
                to={topic.to}
                className="mt-3 text-sm font-bold text-[#D4FF24] transition hover:opacity-80"
              >
                {topic.cta} →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
