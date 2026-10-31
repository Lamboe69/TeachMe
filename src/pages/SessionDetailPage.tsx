import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  MapPin,
  MessageSquare,
  NotebookPen,
  Star,
  Wallet,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionStatusBadge } from '@/components/session/SessionStatusBadge';
import { StarRating } from '@/components/ui/StarRating';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import {
  formatDateTime,
  formatDuration,
  formatTime,
  formatUGX,
} from '@/utils/format';
import { getSessionActions } from '@/utils/sessionPermissions';

export function SessionDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { data: session, error, loading, reload, setData } = useAsyncData(
    () => services.sessions.get(id),
    [id],
  );

  if (loading) {
    return (
      <AppShell title="Session">
        <div className="container-page py-10 sm:py-14">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-40 w-full rounded-card" />
          <Skeleton className="mt-4 h-56 w-full rounded-card" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Session">
      <div className="container-page py-10 sm:py-14">
        <Alert
          tone={error.isForbidden ? 'warning' : 'error'}
          title={
            error.isForbidden
              ? 'You do not have access to this session'
              : error.isNotFound
                ? 'Session not found'
                : 'We could not load this session'
          }
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
        <div className="mt-6">
          <ButtonLink to="/sessions" variant="ghost" leftIcon={ArrowLeft}>
            Back to my sessions
          </ButtonLink>
        </div>
      </div>
      </AppShell>
    );
  }

  if (!session) return null;

  const actions = getSessionActions(session, user);
  const isTutor = session.tutor.id === user?.id;
  const counterpart = isTutor ? session.student : session.tutor;
  const myConfirmed = isTutor ? !!session.tutorConfirmedAt : !!session.studentConfirmedAt;
  const otherConfirmed = isTutor ? !!session.studentConfirmedAt : !!session.tutorConfirmedAt;

  return (
    <AppShell title="Session">
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-[#7eb3ff]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to my sessions
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar name={counterpart.fullName} src={counterpart.avatarUrl} size="lg" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                    {isTutor ? 'Student' : 'Tutor'}
                  </p>
                  <h1 className="truncate text-xl font-bold tracking-tight text-white">
                    {counterpart.fullName}
                  </h1>
                  <p className="mt-1 text-sm text-[#7eb3ff]">{session.subject}</p>
                </div>
              </div>
              <SessionStatusBadge status={session.status} className="mt-1" />
            </div>

            <dl className="mt-7 grid gap-5 border-t border-[rgba(21,88,201,0.2)] pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#7eb3ff]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-white/45">Scheduled for</dt>
                  <dd className="text-sm font-semibold text-white">
                    {formatDateTime(session.scheduledAt)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#7eb3ff]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-white/45">Time and length</dt>
                  <dd className="text-sm font-semibold text-white">
                    {formatTime(session.scheduledAt)} · {formatDuration(session.durationMinutes)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-[#7eb3ff]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-white/45">Session fee</dt>
                  <dd className="text-sm font-semibold text-white">{formatUGX(session.fee)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#7eb3ff]" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-white/45">Meeting place</dt>
                  <dd className="text-sm font-semibold text-white">
                    {isTutor ? session.tutor.location ?? 'Agreed with the student' : 'Agreed with your tutor'}
                  </dd>
                </div>
              </div>
            </dl>

            {session.message ? (
              <div className="mt-6 rounded-xl bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/45">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  Message from the student
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {session.message}
                </p>
              </div>
            ) : null}

            {session.notes ? (
              <div className="mt-4 rounded-xl bg-[rgba(21,88,201,0.15)] p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#7eb3ff]">
                  <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
                  Tutor notes
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/80">
                  {session.notes}
                </p>
              </div>
            ) : null}
          </Card>

          <div className="mt-6">
            <SessionChat sessionId={session.id} />
          </div>

          <section aria-labelledby="actions-heading" className="mt-6">
            <Card className="p-6 sm:p-8">
              <h2 id="actions-heading" className="text-lg font-bold text-white">
                What you can do
              </h2>

              {session.status === 'REQUESTED' ? (
                <Alert tone="info" className="mt-4">
                  {isTutor
                    ? 'This request is waiting for your decision. Accept it to confirm the lesson, or decline it if you are not available. The student has already paid into escrow.'
                    : 'Your tutor has not confirmed this request yet. Your fee is held safely in escrow until the session is completed.'}
                </Alert>
              ) : null}

              {session.status === 'ACCEPTED' ? (
                myConfirmed ? (
                  <Alert tone="success" className="mt-4" title="Your confirmation is in">
                    Waiting for {counterpart.fullName} to confirm the session took place. The fee
                    stays in escrow until both of you confirm.
                  </Alert>
                ) : otherConfirmed ? (
                  <Alert tone="info" className="mt-4" title={`${counterpart.fullName} confirmed`}>
                    If the session took place, confirm it too. Payment is released to the tutor as
                    soon as both of you approve.
                  </Alert>
                ) : (
                  <Alert tone="info" className="mt-4">
                    This session is confirmed and the fee is held securely in escrow. After it takes
                    place, both you and {isTutor ? 'the student' : 'the tutor'} must confirm before
                    TutorUG releases payment.
                  </Alert>
                )
              ) : null}

              {session.status === 'COMPLETED' ? (
                <Alert tone="success" className="mt-4">
                  Both parties confirmed this session.
                  {isTutor
                    ? ' Your earnings have been released to your wallet, minus the TutorUG fee.'
                    : ' The tutor has been paid. Your fee is no longer held in escrow.'}
                  {actions.canReview
                    ? ' Share how it went to help other learners.'
                    : ' Thanks for taking part.'}
                </Alert>
              ) : null}

              {session.status === 'CANCELLED' || session.status === 'REJECTED' ? (
                <Alert tone="warning" className="mt-4">
                  {session.status === 'REJECTED'
                    ? 'The tutor could not take this session. Your fee has been refunded to your wallet — you can send a new request with a different time.'
                    : 'This session was cancelled. Your fee has been refunded to your wallet — you can request a new one whenever you are ready.'}
                </Alert>
              ) : null}

              <div className="mt-5">
                <SessionActions
                  session={session}
                  onUpdated={(updated) => setData(updated)}
                />
              </div>

              {actions.canReview ? (
                <div className="mt-5 border-t border-[rgba(21,88,201,0.2)] pt-5">
                  <ButtonLink to={`/sessions/${session.id}/feedback`} leftIcon={Star}>
                    Write a review for {session.tutor.fullName}
                  </ButtonLink>
                </div>
              ) : null}

              {session.hasReview ? (
                <p className="mt-5 flex items-center gap-2 border-t border-[rgba(21,88,201,0.2)] pt-5 text-sm text-white/45">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  You have already reviewed this session.
                </p>
              ) : null}
            </Card>
          </section>
        </div>

        {/* ---------------------------------------------------- Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h2 className="text-sm font-bold text-white">Session summary</h2>
            <dl className="mt-4 space-y-3">
              {[
                { label: 'Subject', value: session.subject },
                {
                  label: 'Status',
                  value:
                    session.status === 'ACCEPTED' &&
                    (session.studentConfirmedAt || session.tutorConfirmedAt)
                      ? 'awaiting both confirmations'
                      : session.status.toLowerCase(),
                },
                { label: 'Duration', value: formatDuration(session.durationMinutes) },
                { label: 'Fee', value: formatUGX(session.fee) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <dt className="text-sm text-white/45">{item.label}</dt>
                  <dd className="text-sm font-semibold capitalize text-white">{item.value}</dd>
                </div>
              ))}
            </dl>

            {session.status === 'ACCEPTED' || session.status === 'COMPLETED' ? (
              <div className="mt-4 space-y-2 border-t border-[rgba(21,88,201,0.2)] pt-4">
                {[
                  { label: 'Your confirmation', done: myConfirmed },
                  { label: `${isTutor ? 'Student' : 'Tutor'} confirmation`, done: otherConfirmed },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-white/45">{item.label}</span>
                    <span className={`text-xs font-bold ${item.done ? 'text-volt-400' : 'text-amber-300'}`}>
                      {item.done ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          {!isTutor ? (
            <Card className="p-6">
              <h2 className="text-sm font-bold text-white">Your tutor</h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={session.tutor.fullName} src={session.tutor.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {session.tutor.fullName}
                  </p>
                  <StarRating value={session.tutor.rating} size="xs" />
                </div>
              </div>
              <ButtonLink
                to={`/tutors/${session.tutor.id}`}
                variant="outline"
                size="sm"
                className="mt-4"
                fullWidth
              >
                View tutor profile
              </ButtonLink>
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-sm font-bold text-white">Your student</h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={session.student.fullName} src={session.student.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {session.student.fullName}
                  </p>
                  <p className="truncate text-xs text-white/45">{session.student.email}</p>
                </div>
              </div>
              {session.student.phone ? (
                <p className="mt-3 text-sm text-white/60">{session.student.phone}</p>
              ) : null}
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-sm font-bold text-white">Payment protection</h2>
            <p className="mt-2 text-sm text-white/60">
              Your fee stays in escrow until both you and {isTutor ? 'the student' : 'the tutor'}{' '}
              confirm the session took place. If a request is declined or cancelled, the fee is
              refunded.
            </p>
            <Badge tone="accepted" className="mt-3">
              In-app chat enabled
            </Badge>
          </Card>
        </aside>
      </div>
    </div>
    </AppShell>
  );
}
