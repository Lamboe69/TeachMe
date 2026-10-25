import { useMemo } from 'react';
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  Clock,
  GraduationCap,
  HeartHandshake,
  Home,
  Inbox,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionCard } from '@/components/session/SessionCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import { firstName, formatRelative, formatUGX } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';

export function TutorDashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useAsyncData(
    () => services.sessions.listMine(),
    [],
  );

  const sessions = useMemo(() => data ?? [], [data]);

  const pending = useMemo(
    () => sessions.filter((session) => session.status === 'REQUESTED'),
    [sessions],
  );

  const upcoming = useMemo(
    () =>
      sessions
        .filter((session) => isUpcoming(session) && session.status === 'ACCEPTED')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const history = useMemo(
    () =>
      sessions
        .filter(
          (session) => session.status === 'COMPLETED' || session.status === 'CANCELLED' || session.status === 'REJECTED',
        )
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [sessions],
  );

  const completedCount = sessions.filter((session) => session.status === 'COMPLETED').length;

  const recentLearners = useMemo(() => {
    const seen = new Map<string, (typeof sessions)[number]>();
    [...sessions]
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .forEach((session) => {
        if (!seen.has(session.student.id)) seen.set(session.student.id, session);
      });
    return Array.from(seen.values()).slice(0, 3);
  }, [sessions]);

  const handleUpdated = (updated: (typeof sessions)[number]) => {
    setData((current) =>
      (current ?? []).map((session) => (session.id === updated.id ? updated : session)),
    );
  };

  const greetingName = firstName(user?.fullName);
  const estimatedEarnings = sessions.reduce(
    (total, session) => total + (session.status === 'COMPLETED' ? session.fee ?? 0 : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-green-50/20">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-ink-200">
          <div className="flex h-16 items-center px-6 border-b border-ink-200">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-ink-950">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link to="/tutor/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutor/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Users className="h-5 w-5" />
              All sessions
            </Link>
          </nav>
        </aside>
        <div className="lg:pl-72 w-full">
          <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Tutor dashboard"
        title={`Welcome back, ${greetingName}`}
        description="Manage learners, teaching sessions, and the subjects you offer to teach."
        actions={
          <ButtonLink to="/tutor/sessions" variant="outline">
            Manage all sessions
          </ButtonLink>
        }
      />

      {/* Prototype: three headline stats — active learners, sessions taught, earnings. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active learners"
          value={recentLearners.length}
          icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
          hint="Students you have taught recently"
        />
        <StatCard
          label="Sessions taught"
          value={completedCount}
          icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
          hint="Completed lessons"
        />
        <StatCard
          label="Wallet balance"
          value={formatUGX(estimatedEarnings)}
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          hint="Sample earnings — no real payouts yet"
        />
      </div>

      {error ? (
        <Alert
          tone="error"
          title="We could not load your sessions"
          className="mt-6"
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : null}

      {/* Prototype: five quick-action cards. */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Incoming requests</h3>
          <p className="mt-1 text-sm text-ink-600">
            Review student requests and accept or decline them.
          </p>
          <ButtonLink to="/tutor/sessions" variant="outline" size="sm" className="mt-4">
            View requests
          </ButtonLink>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">My learners</h3>
          <p className="mt-1 text-sm text-ink-600">
            Open active and past learners you have taught.
          </p>
          <ButtonLink to="/tutor/sessions" variant="outline" size="sm" className="mt-4">
            View learners
          </ButtonLink>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Course units</h3>
          <p className="mt-1 text-sm text-ink-600">
            Manage the subjects and notes you offer to teach.
          </p>
          <span className="mt-4 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-400">
            Coming soon
          </span>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Wallet &amp; earnings</h3>
          <p className="mt-1 text-sm text-ink-600">
            Review your teaching earnings and session history.
          </p>
          <span className="mt-4 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-400">
            Coming soon
          </span>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Student view</h3>
          <p className="mt-1 text-sm text-ink-600">
            Tutors can also use the student-facing features to browse peers.
          </p>
          <ButtonLink to="/tutors" variant="outline" size="sm" className="mt-4">
            Switch to student view
          </ButtonLink>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          {/* ------------------------------------------- Booking requests */}
          <section aria-labelledby="requests-heading" className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 id="requests-heading" className="text-lg font-bold text-ink-900">
                Booking requests
              </h2>
              {pending.length > 0 ? (
                <Badge tone="pending">{pending.length} waiting</Badge>
              ) : null}
            </div>

            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-44 w-full rounded-card" />
                ))
              ) : null}

              {!loading && pending.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-10 w-10" aria-hidden="true" />}
                  title="No pending requests"
                  description="When a student requests a lesson from you it will appear here for you to accept or decline."
                />
              ) : null}

              {!loading &&
                pending.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    perspective="tutor"
                    actions={
                      <SessionActions session={session} onUpdated={handleUpdated} compact />
                    }
                  />
                ))}
            </div>
          </section>

          {/* -------------------------------------------------- Upcoming */}
          <section aria-labelledby="tutor-upcoming-heading" className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 id="tutor-upcoming-heading" className="text-lg font-bold text-ink-900">
                Upcoming lessons
              </h2>
              <Link
                to="/tutor/sessions"
                className="text-sm font-semibold text-green-700 transition hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {!loading && upcoming.length === 0 ? (
                <EmptyState
                  icon={<CalendarClock className="h-10 w-10" aria-hidden="true" />}
                  title="No confirmed lessons scheduled"
                  description="Accept a booking request to see it here with the date, time and student details."
                />
              ) : null}

              {!loading &&
                upcoming.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    perspective="tutor"
                    actions={
                      <SessionActions session={session} onUpdated={handleUpdated} compact />
                    }
                  />
                ))}
            </div>
          </section>

          {/* --------------------------------------------------- History */}
          <section aria-labelledby="history-heading" className="min-w-0">
            <h2 id="history-heading" className="text-lg font-bold text-ink-900">
              Session history
            </h2>

            <div className="mt-4 space-y-4">
              {!loading && history.length === 0 ? (
                <EmptyState
                  icon={<Clock className="h-10 w-10" aria-hidden="true" />}
                  title="No past sessions yet"
                  description="Completed and cancelled lessons will be listed here."
                />
              ) : null}

              {!loading &&
                history.slice(0, 5).map((session) => (
                  <SessionCard key={session.id} session={session} perspective="tutor" />
                ))}
            </div>
          </section>
        </div>

        {/* -------------------------------------------------- Sidebar */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-ink-900">Your teaching at a glance</h2>
            <dl className="mt-4 space-y-3">
              {[
                { label: 'Requests awaiting a reply', value: pending.length },
                { label: 'Confirmed lessons', value: upcoming.length },
                { label: 'Completed lessons', value: completedCount },
                {
                  label: 'Response rate',
                  value:
                    sessions.length > 0
                      ? `${Math.round(
                          ((sessions.length - pending.length) / sessions.length) * 100,
                        )}%`
                      : '—',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <dt className="text-sm text-ink-500">{item.label}</dt>
                  <dd className="text-sm font-semibold text-ink-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <GraduationCap className="h-4 w-4 text-green-600" aria-hidden="true" />
              Keeping your profile fresh
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Learners filter peers by subject, rate and location. Make sure your profile lists
              every subject you are happy to teach.
            </p>
            <p className="mt-3 flex items-start gap-2 text-xs text-ink-500">
              <CalendarCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Profile editing for tutors is coming in a later release.
            </p>
          </Card>

          <Card className="bg-green-50 p-5">
            <h2 className="text-sm font-bold text-green-900">Latest request</h2>
            {pending.length > 0 ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={pending[0].student.fullName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-green-900">
                      {pending[0].student.fullName}
                    </p>
                    <p className="truncate text-xs text-green-900/70">
                      {pending[0].subject} · {formatRelative(pending[0].scheduledAt)}
                    </p>
                  </div>
                </div>
                <ButtonLink to={`/sessions/${pending[0].id}`} size="sm" className="mt-4" fullWidth>
                  Review request
                </ButtonLink>
              </>
            ) : (
              <p className="mt-2 text-sm text-green-900/80">
                You have no open requests right now.
              </p>
            )}
          </Card>
        </aside>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
