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
      className={`min-w-0 rounded-card border border-[rgba(21,88,201,0.25)] bg-[rgba(21,88,201,0.08)] p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={other.fullName} src={other.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {perspective === 'student' ? 'Tutor' : 'Student'}: {other.fullName}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#7eb3ff]">{session.subject}</p>
          </div>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
          <div>
            <dt className="text-xs text-white/45">Date</dt>
            <dd className="text-sm font-medium text-white/90">{formatDayLabel(session.scheduledAt)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
          <div>
            <dt className="text-xs text-white/45">Time</dt>
            <dd className="text-sm font-medium text-white/90">
              {formatTime(session.scheduledAt)}
              <span className="font-normal text-white/45"> · {formatDuration(session.durationMinutes)}</span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
          <div>
            <dt className="text-xs text-white/45">Fee</dt>
            <dd className="text-sm font-medium text-white/90">{formatUGX(session.fee)}</dd>
          </div>
        </div>
      </dl>

      {session.message ? (
        <p className="mt-4 flex gap-2 rounded-lg bg-white/[0.04] p-3 text-sm text-white/60">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden="true" />
          <span className="min-w-0 break-words">{session.message}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(21,88,201,0.2)] pt-4">
        <Link
          to={`/sessions/${session.id}`}
          className="text-sm font-semibold text-[#7eb3ff] transition hover:text-white hover:underline"
        >
          View session details
        </Link>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </article>
  );
}
