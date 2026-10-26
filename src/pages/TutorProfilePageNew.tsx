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
import { firstName, formatDate, formatRate } from '@/utils/format';

function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-green-100">
          <div className="flex h-20 items-center px-6 border-b border-green-100">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-ink-950">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link
              to={isStudent ? '/student/dashboard' : user ? '/tutor/dashboard' : '/login'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/tutors"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold"
            >
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link
              to={user ? '/sessions' : '/login'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            {user && (
              <Link
                to="/wallet"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                <Wallet className="h-5 w-5" />
                Wallet
              </Link>
            )}
            {user && (
              <Link
                to={isStudent ? '/student/profile' : '/tutor/profile/edit'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            )}
          </nav>
          <div className="p-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 ring-1 ring-amber-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-700" />
                <p className="text-xs font-bold text-amber-900">Secure payments</p>
              </div>
              <p className="mt-1 text-xs text-amber-800">Held by TutorUG until your session is complete.</p>
            </div>
          </div>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link
                to="/tutors"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 transition hover:text-green-700"
              >
                <ArrowLeft className="h-4 w-4" />
                All tutors
              </Link>
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="hidden text-sm font-semibold text-ink-900 sm:inline">
                      {user.fullName}
                    </span>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-green-700">
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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
          <div className="h-40 rounded-2xl bg-white ring-1 ring-green-200" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="h-32 rounded-2xl bg-white ring-1 ring-green-200" />
              <div className="h-64 rounded-2xl bg-white ring-1 ring-green-200" />
            </div>
            <div className="h-72 rounded-2xl bg-white ring-1 ring-green-200" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !tutor) {
    const notFound = error?.isNotFound ?? !tutor;
    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-lg ring-1 ring-green-200">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-green-100 to-amber-100">
            <Search className="h-10 w-10 text-green-700" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-ink-950">
            {notFound ? 'Tutor not found' : 'We could not load this tutor'}
          </h1>
          <p className="mt-3 text-lg text-ink-700">
            {notFound
              ? 'We could not find that tutor. They may no longer be on TutorUG.'
              : error?.message}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/tutors"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3 font-bold text-white shadow-lg"
            >
              Browse tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-300 px-7 py-3 font-bold text-green-700"
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
          <section className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-green-200">
            <div className="h-24 bg-gradient-to-r from-green-700 via-emerald-700 to-green-800">
              <div className="flex h-full items-center justify-end px-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  <BadgeCheck className="h-4 w-4" />
                  Verified peer tutor
                </span>
              </div>
            </div>
            <div className="px-6 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 text-3xl font-black text-white ring-4 ring-white shadow-lg">
                  {tutor.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <h1 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
                    {tutor.fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {tutor.rating ? tutor.rating.toFixed(1) : '—'}
                      <span className="font-normal text-ink-600">({tutor.reviewCount} reviews)</span>
                    </span>
                    {tutor.location ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-600">
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
                        className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition hover:bg-green-100"
                      >
                        {subject}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-6 grid gap-4 border-t border-green-100 pt-6 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-100">
                    <GraduationCap className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Experience</dt>
                    <dd className="text-sm font-bold text-ink-950">
                      {tutor.yearsExperience ? `${tutor.yearsExperience} years` : 'Not specified'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100">
                    <BookOpen className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Sessions taught</dt>
                    <dd className="text-sm font-bold text-ink-950">{tutor.sessionCount}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-100">
                    <Wallet className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Rate per session</dt>
                    <dd className="text-sm font-bold text-ink-950">{formatRate(tutor.hourlyRate)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </section>

          {tutor.availability?.some((slot) => slot.enabled) ? (
            <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-ink-950">Weekly availability</h2>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
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
                      className="flex items-center justify-between gap-3 rounded-xl bg-green-50/60 px-4 py-3 ring-1 ring-green-100"
                    >
                      <span className="text-sm font-semibold text-ink-900">{day}</span>
                      <span className={`text-right text-sm ${times.length > 0 ? 'text-green-700' : 'text-ink-400'}`}>
                        {times.length > 0 ? times.join(', ') : 'Unavailable'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Bookings are limited to these times. Times may be adjusted by the tutor.
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 sm:p-8">
            <h2 className="text-xl font-bold text-ink-950">
              About {firstName(tutor.fullName)}
            </h2>
            {tutor.bio ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-700">{tutor.bio}</p>
            ) : (
              <p className="mt-3 text-ink-500">This tutor has not added a biography yet.</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink-950">Reviews ({tutor.reviewCount})</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {tutor.rating ? tutor.rating.toFixed(1) : '—'}
              </span>
            </div>

            {tutor.reviews.length === 0 ? (
              <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                No reviews yet. Be the first to share how your session went.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-green-100">
                {tutor.reviews.map((review) => (
                  <li key={review.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                          {(review.studentName ?? 'L').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-950">
                            {review.studentName ?? 'TutorUG learner'}
                          </p>
                          {review.createdAt && (
                            <p className="text-xs text-ink-500">{formatDate(review.createdAt)}</p>
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
                                : 'text-ink-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
            <p className="text-sm text-ink-600">Rate per session</p>
            <p className="mt-1 text-3xl font-black text-ink-950">{formatRate(tutor.hourlyRate)}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
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
                <p key={item} className="flex items-start gap-2 text-sm text-ink-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100">
                    <svg viewBox="0 0 20 20" className="h-3 w-3 fill-green-700">
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
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg transition hover:shadow-xl"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg"
                >
                  Log in to book
                </Link>
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-green-300 px-6 py-3 font-bold text-green-700"
                >
                  Create a free account
                </Link>
              </div>
            )}

            {isSignedIn && isOwnProfile && (
              <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
                This is your public profile. Update your details or availability from your dashboard.
              </div>
            )}

            <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/85">
              Paying holds the session fee in escrow and unlocks chat with this tutor.
            </p>

            <div className="mt-6 space-y-2 border-t border-green-100 pt-4 text-xs text-ink-600">
              <p className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Rated {tutor.rating ? tutor.rating.toFixed(1) : '—'} by {tutor.reviewCount} learner
                {tutor.reviewCount === 1 ? '' : 's'}
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-green-700" />
                {tutor.sessionCount} session{tutor.sessionCount === 1 ? '' : 's'} taught on TutorUG
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-green-700" />
                Contact details shared after booking
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
