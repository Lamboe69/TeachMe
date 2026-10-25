import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { DemoBanner } from '@/components/ui/DemoBanner';

const HIGHLIGHTS = [
    {
      icon: GraduationCap,
      title: 'Peer-reviewed',
      description: 'Every tutor is reviewed by our team before they appear in the directory.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent pricing',
      description: 'See the session rate in shillings upfront — no hidden charges.',
    },
    {
      icon: Sparkles,
      title: 'Book in minutes',
      description: 'Request a session, get a confirmation, and keep track of everything in one place.',
    },
  ];

/** Split layout used by the login / register / forgot-password screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <DemoBanner />
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="mb-8 lg:mb-0">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-ink-600">{subtitle}</p> : null}

            <ul className="mt-8 hidden space-y-4 lg:block">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-ink-200 bg-white p-6 shadow-card sm:p-8">
            {children}
            {footer ? <div className="mt-6 border-t border-ink-100 pt-5">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
