import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Sparkles, X } from 'lucide-react';
import { useDismissible } from '@/hooks/useDismissible';
import type { Session, Wallet } from '@/types';

const VOLT = '#D4FF24';
const COBALT = '#1558C9';
const NIGHT = '#030407';

interface Step {
  key: string;
  label: string;
  hint: string;
  to: string;
  done: boolean;
}

function buildSteps(sessions: Session[], wallet: Wallet | null): Step[] {
  const completed = sessions.filter((s) => s.status === 'COMPLETED');
  const firstUnreviewed = completed.find((s) => !s.hasReview);
  return [
    {
      key: 'wallet',
      label: 'Top up your wallet',
      hint: 'Add money with MTN MoMo or Airtel Money',
      to: '/wallet',
      done: (wallet?.availableBalance ?? 0) > 0,
    },
    {
      key: 'book',
      label: 'Book your first session',
      hint: 'Pick a tutor and a time that suits you',
      to: '/tutors',
      done: sessions.length > 0,
    },
    {
      key: 'complete',
      label: 'Complete a session',
      hint: 'Attend, then confirm it happened',
      to: '/sessions',
      done: completed.length > 0,
    },
    {
      key: 'review',
      label: 'Review your sessions',
      hint: 'Leave a star rating for each tutor',
      to: firstUnreviewed ? `/sessions/${firstUnreviewed.id}/feedback` : '/sessions',
      done: completed.length > 0 && completed.every((s) => s.hasReview),
    },
  ];
}

/**
 * A first-run checklist that teaches the four things a new learner needs to
 * do. It disappears once every step is done or the learner dismisses it.
 */
export function GettingStarted({
  sessions,
  wallet,
  userId,
}: {
  sessions: Session[];
  wallet: Wallet | null;
  userId?: string;
}) {
  const { dismissed, dismiss } = useDismissible(`tutorug.gettingStarted.dismissed.${userId ?? 'anon'}`);
  const steps = buildSteps(sessions, wallet);
  const doneCount = steps.filter((s) => s.done).length;

  if (dismissed || doneCount === steps.length) return null;

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(135deg, rgba(21,88,201,0.18) 0%, rgba(21,88,201,0.06) 100%)', border: '1px solid rgba(21,88,201,0.35)' }}
    >
      <div className="flex items-center gap-3 px-5 pt-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: VOLT }}>
          <Sparkles className="h-5 w-5" style={{ color: NIGHT }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Getting started</p>
          <p className="text-xs text-white/50">A few quick steps to make the most of TutorUG</p>
        </div>
        <span className="shrink-0 text-xs font-bold" style={{ color: VOLT }}>{doneCount}/{steps.length}</span>
        <button
          type="button"
          onClick={dismiss}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 transition hover:text-white"
          aria-label="Dismiss getting started"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%`, background: VOLT }} />
        </div>
      </div>

      <div className="p-3">
        {steps.map((step) => (
          <Link
            key={step.key}
            to={step.to}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/5"
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: VOLT }} />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-white/25" />
            )}
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-semibold ${step.done ? 'text-white/40 line-through' : 'text-white'}`}>
                {step.label}
              </span>
              {!step.done && <span className="block text-xs text-white/45">{step.hint}</span>}
            </span>
            {!step.done && <ArrowRight className="h-4 w-4 shrink-0" style={{ color: COBALT }} />}
          </Link>
        ))}
      </div>
    </div>
  );
}
