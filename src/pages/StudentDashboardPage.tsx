import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Calendar,
  GraduationCap,
  Home,
  MessageSquareText,
  Search,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { StarRating } from '@/components/ui/StarRating';
import { SessionCard } from '@/components/session/SessionCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import { firstName, formatRelative } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';

export function StudentDashboardPage() {
  const { user } = useAuth();

  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const tutorsState = useAsyncData(() => services.tutors.list({}), []);

  const sessions = useMemo(() => sessionsState.data ?? [], [sessionsState.data]);

  const upcoming = useMemo(
    () =>
      sessions
        .filter((session) => isUpcoming(session))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const completed = useMemo(
    () => sessions.filter((session) => session.status === 'COMPLETED'),
    [sessions],
  );

  const needsReview = useMemo(
    () => completed.filter((session) => !session.hasReview),
    [completed],
  );

  const recentTutors = useMemo(() => {
    const seen = new Map<string, (typeof sessions)[number]>();
    [...sessions]
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .forEach((session) => {
        if (!seen.has(session.tutor.id)) seen.set(session.tutor.id, session);
      });
    return Array.from(seen.values()).slice(0, 3);
  }, [sessions]);

  const greetingName = firstName(user?.fullName);
  const learningHours = sessions.reduce(
    (total, session) => total + (session.durationMinutes ?? 60) / 60,
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
            <Link to="/student/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Calendar className="h-5 w-5" />
              My sessions
            </Link>
            <Link to="/student/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <User className="h-5 w-5" />
              Profile
            </Link>
          </nav>
        </aside>
        <div className="lg:pl-72 w-full">
          <div className="container-page py-10 sm:py-14">
            <PageHeader
              eyebrow="Student dashboard"
              title={`Welcome back, ${greetingName}`}
              description="Find university course unit support and track your learning progress."
              actions={
                <ButtonLink to="/tutors" leftIcon={Search}>
                  Find a tutor
                </ButtonLink>
              }
            />

      {/* Prototype: three headline stats — learning hours, upcoming, completed. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Learning hours"
          value={learningHours.toFixed(1)}
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          hint="Total time spent in sessions"
        />
        <StatCard
          label="Upcoming sessions"
          value={upcoming.length}
          icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
          hint="Confirmed or awaiting confirmation"
        />
        <StatCard
          label="Completed sessions"
          value={completed.length}
          icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
          hint="Lessons you have taken"
        />
      </div>

      {sessionsState.error ? (
        <Alert
          tone="error"
          title="We could not load your sessions"
          className="mt-6"
          action={
            <Button variant="outline" size="sm" onClick={sessionsState.reload}>
              Try again
            </Button>
          }
        >
          {sessionsState.error.message}
        </Alert>
      ) : null}

      {/* Prototype: four quick-action cards. */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Find a tutor</h3>
          <p className="mt-1 text-sm text-ink-600">
            Search by course unit, rating, price, and availability.
          </p>
          <ButtonLink to="/tutors" variant="outline" size="sm" className="mt-4">
            Browse tutors
          </ButtonLink>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">My sessions</h3>
          <p className="mt-1 text-sm text-ink-600">
            View requests, upcoming appointments, and completed sessions.
          </p>
          <ButtonLink to="/sessions" variant="outline" size="sm" className="mt-4">
            View sessions
          </ButtonLink>
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <Star className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Give feedback</h3>
          <p className="mt-1 text-sm text-ink-600">
            Rate a completed session to help other learners choose peers.
          </p>
          {needsReview.length > 0 ? (
            <ButtonLink to="/sessions" variant="outline" size="sm" className="mt-4">
              Review now
            </ButtonLink>
          ) : (
            <span className="mt-4 inline-flex h-9 items-center rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-400">
              Nothing to review
            </span>
          )}
        </Card>
        <Card className="flex flex-col p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-bold text-ink-900">Become a tutor</h3>
          <p className="mt-1 text-sm text-ink-600">
            Teach the subjects you have already mastered, on your own schedule.
          </p>
          <ButtonLink to="/register?role=TUTOR" variant="outline" size="sm" className="mt-4">
            Start tutoring
          </ButtonLink>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------- Upcoming */}
        <section aria-labelledby="upcoming-heading" className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 id="upcoming-heading" className="text-lg font-bold text-ink-900">
              Upcoming sessions
            </h2>
            <Link
              to="/sessions"
              className="text-sm font-semibold text-green-700 transition hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {sessionsState.loading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-card" />
              ))
            ) : null}

            {!sessionsState.loading && upcoming.length === 0 ? (
              <EmptyState
                icon={<CalendarClock className="h-10 w-10" aria-hidden="true" />}
                title="No upcoming sessions"
                description="When you book a lesson it will appear here with the date, time and tutor details."
                action={<ButtonLink to="/tutors">Find a tutor</ButtonLink>}
              />
            ) : null}

            {!sessionsState.loading &&
              upcoming.map((session) => (
                <SessionCard key={session.id} session={session} perspective="student" />
              ))}
          </div>

          {/* -------------------------------------------- Pending reviews */}
          {needsReview.length > 0 ? (
            <section aria-labelledby="review-heading" className="mt-8">
              <h2 id="review-heading" className="text-lg font-bold text-ink-900">
                Waiting for your review
              </h2>
              <ul className="mt-4 space-y-3">
                {needsReview.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-200/80 bg-white p-4 shadow-card"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={session.tutor.fullName} src={session.tutor.avatarUrl} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {session.tutor.fullName}
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {session.subject} · {formatRelative(session.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    <ButtonLink
                      to={`/sessions/${session.id}/feedback`}
                      size="sm"
                      variant="outline"
                      leftIcon={Star}
                    >
                      Rate & review
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>

        {/* ------------------------------------------------- Sidebar */}
        <aside className="min-w-0 space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-ink-900">Your tutors</h2>
            <p className="mt-1 text-xs text-ink-500">
              Tutors you have worked with recently.
            </p>

            <ul className="mt-4 space-y-4">
              {recentTutors.length === 0 ? (
                <li className="text-sm text-ink-500">No tutors yet.</li>
              ) : (
                recentTutors.map((session) => (
                  <li key={session.tutor.id} className="flex items-center gap-3">
                    <Avatar
                      name={session.tutor.fullName}
                      src={session.tutor.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/tutors/${session.tutor.id}`}
                        className="block truncate text-sm font-semibold text-ink-900 hover:text-green-700"
                      >
                        {session.tutor.fullName}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2">
                        <StarRating value={session.tutor.rating} size="xs" showValue={false} />
                        <span className="text-xs text-ink-500">
                          {session.tutor.subjects.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </div>
                    <Badge tone="neutral">{session.subject}</Badge>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
              Suggested tutors
            </h2>
            <p className="mt-1 text-xs text-ink-500">Based on the subjects you are studying.</p>

            <div className="mt-4 space-y-4">
              {tutorsState.loading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))
                : null}

              {!tutorsState.loading &&
                (tutorsState.data?.content ?? []).slice(0, 2).map((tutor) => (
                  <div key={tutor.id} className="flex items-center gap-3">
                    <Avatar name={tutor.fullName} src={tutor.avatarUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/tutors/${tutor.id}`}
                        className="block truncate text-sm font-semibold text-ink-900 hover:text-green-700"
                      >
                        {tutor.fullName}
                      </Link>
                      <p className="truncate text-xs text-ink-500">
                        {tutor.subjects.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <ButtonLink to="/tutors" variant="outline" size="sm" fullWidth className="mt-4">
              Browse all tutors
            </ButtonLink>
          </Card>

          <Card className="bg-green-50 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-green-900">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Need help with a booking?
            </h2>
            <p className="mt-2 text-sm text-green-900/80">
              Pay through TutorUG with MTN or Airtel Mobile Money. Money is held until the session is completed.
            </p>
          </Card>
        </aside>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
