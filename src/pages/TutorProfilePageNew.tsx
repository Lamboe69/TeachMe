import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calendar,
  CalendarClock,
  GraduationCap,
  Home,
  Mail,
  MapPin,
  Search,
  Shield,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import { expandAvailabilitySlot, WEEK_DAYS } from '@/utils/availability';
import { firstName, formatDate, formatRate, getInitials } from '@/utils/format';

function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-night-700">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-gradient-to-b from-night-900 to-night-950 border-r border-[rgba(21,88,201,0.25)] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
          <div className="flex h-20 items-center px-6 border-b border-[rgba(21,88,201,0.2)]">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-volt-400 shadow-[0_0_20px_rgba(212,255,36,0.3)]">
                <GraduationCap className="h-6 w-6 text-night-950" />
              </div>
              <span className="font-display text-xl font-extrabold text-white">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link
              to={isStudent ? '/student/dashboard' : user ? '/tutor/dashboard' : '/login'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:bg-[rgba(21,88,201,0.15)] hover:text-volt-400 transition"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/tutors"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(21,88,201,0.25)] text-white font-bold shadow-[inset_3px_0_0_#D4FF24]"
            >
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link
              to={user ? '/sessions' : '/login'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:bg-[rgba(21,88,201,0.15)] hover:text-volt-400 transition"
            >
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            {user && (
              <Link
                to="/wallet"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:bg-[rgba(21,88,201,0.15)] hover:text-volt-400 transition"
              >
                <Wallet className="h-5 w-5" />
                Wallet
              </Link>
            )}
            {user && (
              <Link
                to={isStudent ? '/student/profile' : '/tutor/profile/edit'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/65 hover:bg-[rgba(21,88,201,0.15)] hover:text-volt-400 transition"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            )}
          </nav>
          <div className="p-4">
            <div className="rounded-2xl bg-[rgba(212,255,36,0.06)] p-4 ring-1 ring-[rgba(212,255,36,0.2)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-volt-400" />
                <p className="text-xs font-bold text-volt-400">Secure payments</p>
              </div>
              <p className="mt-1 text-xs text-volt-400">Held by TutorUG until your session is complete.</p>
            </div>
          </div>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-night-800/90 backdrop-blur-xl border-b border-[rgba(21,88,201,0.2)]">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link
                to="/tutors"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 transition hover:text-volt-400"
              >
                <ArrowLeft className="h-4 w-4" />
                All tutors
              </Link>
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[rgba(21,88,201,0.15)] px-3 py-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cobalt-500 to-cobalt-700 text-xs font-black text-volt-400">
                      {getInitials(user.fullName)}
                    </div>
                    <span className="hidden text-sm font-semibold text-white/90 sm:inline">
                      {user.fullName}
                    </span>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-semibold text-white/65 hover:text-volt-400">
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-xl bg-volt-400 px-5 py-2.5 text-sm font-bold text-night-950 shadow-[0_8px_24px_-10px_rgba(212,255,36,0.65)] transition hover:bg-volt-300"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="animate-rise px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function TutorProfilePageNew() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const { data: tutor, error, loading } = useAsyncData(() => services.tutors.get(id), [id]);

  const isSignedIn = status === 'authenticated' && !!user;
  const isOwnProfile = !!user && !!tutor && user.id === tutor.id;

  if (loading) {
    return (
      <Shell>
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl bg-[rgba(21,88,201,0.08)] ring-1 ring-[rgba(21,88,201,0.3)]" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="h-32 rounded-2xl bg-[rgba(21,88,201,0.08)] ring-1 ring-[rgba(21,88,201,0.3)]" />
              <div className="h-64 rounded-2xl bg-[rgba(21,88,201,0.08)] ring-1 ring-[rgba(21,88,201,0.3)]" />
            </div>
            <div className="h-72 rounded-2xl bg-[rgba(21,88,201,0.08)] ring-1 ring-[rgba(21,88,201,0.3)]" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !tutor) {
    const notFound = error?.isNotFound ?? !tutor;
    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-3xl bg-[rgba(21,88,201,0.08)] p-10 text-center shadow-lg ring-1 ring-[rgba(21,88,201,0.3)]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-cobalt-500/30 to-volt-400/20">
            <Search className="h-10 w-10 text-volt-400" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-white">
            {notFound ? 'Tutor not found' : 'We could not load this tutor'}
          </h1>
          <p className="mt-3 text-lg text-white/65">
            {notFound
              ? 'We could not find that tutor. They may no longer be on TutorUG.'
              : error?.message}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/tutors"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-volt-400 px-7 py-3 font-bold text-night-950 shadow-[0_8px_24px_-10px_rgba(212,255,36,0.65)] transition hover:bg-volt-300"
            >
              Browse tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[rgba(21,88,201,0.5)] px-7 py-3 font-bold text-volt-400"
            >
              Back home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl bg-[rgba(21,88,201,0.08)] shadow-lg ring-1 ring-[rgba(21,88,201,0.3)]">
            <div className="h-24 bg-gradient-to-r from-cobalt-600 via-cobalt-700 to-night-950">
              <div className="flex h-full items-center justify-end px-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  <BadgeCheck className="h-4 w-4" />
                  Verified peer tutor
                </span>
              </div>
            </div>
            <div className="px-6 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cobalt-500 to-cobalt-700 text-3xl font-black text-volt-400 ring-4 ring-night-800 shadow-[0_0_32px_-6px_rgba(21,88,201,0.8)]">
                  {getInitials(tutor.fullName)}
                  {tutor.rating != null && tutor.rating >= 4.8 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-volt-400 px-2 py-0.5 text-[10px] font-black text-night-950 shadow-[0_0_16px_rgba(212,255,36,0.5)]">
                      TOP
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {tutor.fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-white/90">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {tutor.rating ? tutor.rating.toFixed(1) : '—'}
                      <span className="font-normal text-white/55">({tutor.reviewCount} reviews)</span>
                    </span>
                    {tutor.location ? (
                      <span className="inline-flex items-center gap-1.5 text-white/55">
                        <MapPin className="h-4 w-4" />
                        {tutor.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {tutor.subjects.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <li key={subject}>
                      <Link
                        to={`/tutors?subject=${encodeURIComponent(subject)}`}
                        className="inline-flex rounded-full bg-[rgba(21,88,201,0.15)] px-3 py-1 text-xs font-semibold text-volt-400 ring-1 ring-[rgba(21,88,201,0.3)] transition hover:bg-[rgba(21,88,201,0.25)]"
                      >
                        {subject}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-6 grid gap-4 border-t border-[rgba(21,88,201,0.2)] pt-6 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(21,88,201,0.25)]">
                    <GraduationCap className="h-5 w-5 text-volt-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-white/45">Experience</dt>
                    <dd className="text-sm font-bold text-white">
                      {tutor.yearsExperience ? `${tutor.yearsExperience} years` : 'Not specified'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(212,255,36,0.15)]">
                    <BookOpen className="h-5 w-5 text-volt-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-white/45">Sessions taught</dt>
                    <dd className="text-sm font-bold text-white">{tutor.sessionCount}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(21,88,201,0.25)]">
                    <Wallet className="h-5 w-5 text-volt-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-white/45">Rate per session</dt>
                    <dd className="text-sm font-bold text-white">{formatRate(tutor.hourlyRate)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </section>

          {tutor.availability?.some((slot) => slot.enabled) ? (
            <section className="rounded-2xl bg-[rgba(21,88,201,0.08)] p-6 shadow-lg ring-1 ring-[rgba(21,88,201,0.3)] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white">Weekly availability</h2>
                <span className="rounded-full bg-[rgba(21,88,201,0.15)] px-3 py-1 text-xs font-semibold text-volt-400 ring-1 ring-[rgba(21,88,201,0.3)]">
                  East Africa Time
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {WEEK_DAYS.map((day) => {
                  const times = (tutor.availability ?? [])
                    .filter((slot) => slot.day === day)
                    .flatMap(expandAvailabilitySlot);
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[rgba(212,255,36,0.05)] px-4 py-3 ring-1 ring-[rgba(21,88,201,0.2)]"
                    >
                      <span className="text-sm font-semibold text-white/90">{day}</span>
                      <span className={`text-right text-sm ${times.length > 0 ? 'text-volt-400' : 'text-white/35'}`}>
                        {times.length > 0 ? times.join(', ') : 'Unavailable'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/45">
                Bookings are limited to these times. Times may be adjusted by the tutor.
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl bg-[rgba(21,88,201,0.08)] p-6 shadow-lg ring-1 ring-[rgba(21,88,201,0.3)] sm:p-8">
            <h2 className="text-xl font-bold text-white">
              About {firstName(tutor.fullName)}
            </h2>
            {tutor.bio ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-white/65">{tutor.bio}</p>
            ) : (
              <p className="mt-3 text-white/45">This tutor has not added a biography yet.</p>
            )}
          </section>

          <section className="rounded-2xl bg-[rgba(21,88,201,0.08)] p-6 shadow-lg ring-1 ring-[rgba(21,88,201,0.3)] sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Reviews ({tutor.reviewCount})</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(212,255,36,0.1)] px-3 py-1 text-sm font-bold text-volt-400 ring-1 ring-[rgba(212,255,36,0.3)]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {tutor.rating ? tutor.rating.toFixed(1) : '—'}
              </span>
            </div>

            {tutor.reviews.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[rgba(21,88,201,0.15)] p-4 text-sm text-volt-400">
                No reviews yet. Be the first to share how your session went.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-[rgba(21,88,201,0.2)]">
                {tutor.reviews.map((review) => (
                  <li key={review.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cobalt-500 to-cobalt-700 text-xs font-black text-volt-400">
                          {getInitials(review.studentName ?? 'TutorUG learner')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {review.studentName ?? 'TutorUG learner'}
                          </p>
                          {review.createdAt && (
                            <p className="text-xs text-white/45">{formatDate(review.createdAt)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${
                              n <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-white/15'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-white/65">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-[rgba(21,88,201,0.08)] p-6 shadow-lg ring-1 ring-[rgba(21,88,201,0.3)]">
            <p className="text-sm text-white/55">Rate per session</p>
            <p className="mt-1 text-3xl font-black text-white">{formatRate(tutor.hourlyRate)}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[rgba(21,88,201,0.15)] px-3 py-1 text-xs font-semibold text-volt-400 ring-1 ring-[rgba(21,88,201,0.3)]">
              <Shield className="h-3.5 w-3.5" />
              Payment held in escrow
            </div>

            <div className="mt-5 space-y-3">
              {[
                'Request a time that suits you',
                'Tutor confirms within 24 hours',
                'Pay securely via MTN MoMo or Airtel Money',
                'Funds released after your session',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-white/65">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[rgba(21,88,201,0.25)]">
                    <svg viewBox="0 0 20 20" className="h-3 w-3 fill-volt-400">
                      <path d="M8 13.5l-3.5-3.5 1.4-1.4L8 10.7l5.1-5.1 1.4 1.4z" />
                    </svg>
                  </span>
                  {item}
                </p>
              ))}
            </div>

            {isSignedIn && !isOwnProfile && (
              <button
                onClick={() => navigate(`/sessions/book/${tutor.id}`)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-volt-400 px-6 py-3.5 font-bold text-night-950 shadow-[0_10px_28px_-10px_rgba(212,255,36,0.7)] transition-all duration-200 hover:scale-[1.01] hover:bg-volt-300 active:scale-[0.99]"
              >
                <CalendarClock className="h-5 w-5" />
                Pay & book this tutor
              </button>
            )}

            {!isSignedIn && (
              <div className="mt-6 space-y-2">
                <Link
                  to="/login"
                  state={{ from: `/tutors/${tutor.id}` }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt-400 px-6 py-3.5 font-bold text-night-950 shadow-[0_10px_28px_-10px_rgba(212,255,36,0.7)] transition hover:bg-volt-300"
                >
                  Log in to book
                </Link>
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-volt-400/40 px-6 py-3 font-bold text-volt-400 transition hover:bg-volt-400/10"
                >
                  Create a free account
                </Link>
              </div>
            )}

            {isSignedIn && isOwnProfile && (
              <div className="mt-6 rounded-xl bg-[rgba(212,255,36,0.1)] p-4 text-sm text-amber-900 ring-1 ring-[rgba(212,255,36,0.3)]">
                This is your public profile. Update your details or availability from your dashboard.
              </div>
            )}

            <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/85">
              Paying holds the session fee in escrow and unlocks chat with this tutor.
            </p>

            <div className="mt-6 space-y-2 border-t border-[rgba(21,88,201,0.2)] pt-4 text-xs text-white/55">
              <p className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Rated {tutor.rating ? tutor.rating.toFixed(1) : '—'} by {tutor.reviewCount} learner
                {tutor.reviewCount === 1 ? '' : 's'}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-volt-400" />
                {tutor.sessionCount} session{tutor.sessionCount === 1 ? '' : 's'} taught on TutorUG
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-volt-400" />
                Contact details shared after booking
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
