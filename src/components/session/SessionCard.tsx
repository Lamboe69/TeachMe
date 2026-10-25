import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Clock, MapPin, MessageSquare } from 'lucide-react';
import type { Session } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { SessionStatusBadge } from '@/components/session/SessionStatusBadge';
import { formatDayLabel, formatDuration, formatTime, formatUGX } from '@/utils/format';

/**
 * A session summary card.
 *
 * `perspective` controls whose details are shown:
 * - `student` shows the tutor (used on the student dashboard / sessions list)
 * - `tutor` shows the student (used on the tutor dashboard / sessions list)
 */
export function SessionCard({
  session,
  perspective,
  actions,
  className,
}: {
  session: Session;
  perspective: 'student' | 'tutor';
  actions?: ReactNode;
  className?: string;
}) {
  const other = perspective === 'student' ? session.tutor : session.student;

  return (
    <article
      data-testid="session-card"
      className={`min-w-0 rounded-card border border-ink-200/80 bg-white p-5 shadow-card ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={other.fullName} src={other.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">
              {perspective === 'student' ? 'Tutor' : 'Student'}: {other.fullName}
            </p>
            <p className="mt-0.5 text-sm font-medium text-brand-700">{session.subject}</p>
          </div>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div>
            <dt className="text-xs text-ink-500">Date</dt>
            <dd className="text-sm font-medium text-ink-800">{formatDayLabel(session.scheduledAt)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div>
            <dt className="text-xs text-ink-500">Time</dt>
            <dd className="text-sm font-medium text-ink-800">
              {formatTime(session.scheduledAt)}
              <span className="font-normal text-ink-500"> · {formatDuration(session.durationMinutes)}</span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <div>
            <dt className="text-xs text-ink-500">Fee</dt>
            <dd className="text-sm font-medium text-ink-800">{formatUGX(session.fee)}</dd>
          </div>
        </div>
      </dl>

      {session.message ? (
        <p className="mt-4 flex gap-2 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <span className="min-w-0 break-words">{session.message}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <Link
          to={`/sessions/${session.id}`}
          className="text-sm font-semibold text-brand-700 transition hover:text-brand-800 hover:underline"
        >
          View session details
        </Link>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </article>
  );
}
