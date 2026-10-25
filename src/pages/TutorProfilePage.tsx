import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Star,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Spinner';
import { StarRating } from '@/components/ui/StarRating';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import { firstName, formatDate, formatRate } from '@/utils/format';

export function TutorProfilePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const { data: tutor, error, loading, reload } = useAsyncData(
    () => services.tutors.get(id),
    [id],
  );

  if (loading) {
    return (
      <div className="container-page py-10 sm:py-14">
        <Skeleton className="h-4 w-24" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10 sm:py-14">
        <Alert
          tone="error"
          title={error.isNotFound ? 'Tutor not found' : 'We could not load this tutor'}
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
        <div className="mt-6">
          <ButtonLink to="/tutors" variant="ghost" leftIcon={ArrowLeft}>
            Back to all tutors
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container-page py-10 sm:py-14">
        <EmptyState
          title="Tutor unavailable"
          description="We could not find the tutor you were looking for."
          action={<ButtonLink to="/tutors">Browse all tutors</ButtonLink>}
        />
      </div>
    );
  }

  const isSignedIn = status === 'authenticated' && !!user;
  const isTutor = user?.role === 'TUTOR';

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/tutors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All tutors
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------ Profile */}
        <div className="min-w-0">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar name={tutor.fullName} src={tutor.avatarUrl} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-ink-900">{tutor.fullName}</h1>
                  <Badge
                    tone="accent"
                    icon={
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    }
                  >
                    Peer tutor
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <StarRating value={tutor.rating} size="sm" />
                  <span className="text-sm text-ink-500">
                    {tutor.reviewCount} review{tutor.reviewCount === 1 ? '' : 's'}
                  </span>
                  {tutor.location ? (
                    <span className="flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin className="h-4 w-4 text-ink-400" aria-hidden="true" />
                      {tutor.location}
                    </span>
                  ) : null}
                </div>

                {tutor.subjects.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Subjects taught">
                    {tutor.subjects.map((subject) => (
                      <li key={subject}>
                        <Link
                          to={`/tutors?subject=${encodeURIComponent(subject)}`}
                          className="inline-block"
                        >
                          <Badge tone="brand">{subject}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-t border-ink-100 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-ink-500">Experience</dt>
                  <dd className="text-sm font-semibold text-ink-900">
                    {tutor.yearsExperience ? `${tutor.yearsExperience} years` : 'Not specified'}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-ink-500">Sessions taught</dt>
                  <dd className="text-sm font-semibold text-ink-900">{tutor.sessionCount}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-medium text-ink-500">Hourly rate</dt>
                  <dd className="text-sm font-semibold text-ink-900">{formatRate(tutor.hourlyRate)}</dd>
                </div>
              </div>
            </dl>
          </Card>

          <section aria-labelledby="about-heading" className="mt-6">
            <Card className="p-6 sm:p-8">
              <h2 id="about-heading" className="text-lg font-bold text-ink-900">
                About {firstName(tutor.fullName)}
              </h2>
              {tutor.bio ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                  {tutor.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink-500">
                  This tutor has not added a biography yet.
                </p>
              )}
            </Card>
          </section>

          {/* --------------------------------------------------- Reviews */}
          <section aria-labelledby="reviews-heading" className="mt-6">
            <Card className="p-6 sm:p-8">
              <h2 id="reviews-heading" className="text-lg font-bold text-ink-900">
                Reviews ({tutor.reviewCount})
              </h2>

              {tutor.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">
                  No reviews yet. Be the first to share how your session went.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-ink-100">
                  {tutor.reviews.map((review) => (
                    <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={review.studentName ?? 'Learner'} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-ink-900">
                              {review.studentName ?? 'Tutor UG learner'}
                            </p>
                            {review.createdAt ? (
                              <p className="text-xs text-ink-500">{formatDate(review.createdAt)}</p>
                            ) : null}
                          </div>
                        </div>
                        <StarRating value={review.rating} size="xs" showValue={false} />
                      </div>
                      {review.comment ? (
                        <p className="mt-3 text-sm leading-relaxed text-ink-700">{review.comment}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>

        {/* ------------------------------------------------- Booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-sm text-ink-500">Hourly rate</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{formatRate(tutor.hourlyRate)}</p>
            <p className="mt-1 text-xs text-ink-500">
              Payment is arranged directly with the tutor after the session.
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                'Request a time that suits you',
                'Tutor confirms within 24 hours',
                'Rate your tutor after the session',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-ink-600">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-600"
                    aria-hidden="true"
                  />
                  {item}
                </p>
              ))}
            </div>

            {isSignedIn && !isTutor ? (
              <Button
                fullWidth
                size="lg"
                className="mt-6"
                leftIcon={CalendarClock}
                onClick={() => navigate(`/sessions/book/${tutor.id}`)}
              >
                Book a session
              </Button>
            ) : null}

            {!isSignedIn ? (
              <div className="mt-6 space-y-2">
                <ButtonLink to="/login" fullWidth size="lg" state={{ from: `/tutors/${tutor.id}` }}>
                  Log in to book
                </ButtonLink>
                <ButtonLink to="/register" variant="outline" fullWidth>
                  Create a free account
                </ButtonLink>
              </div>
            ) : null}

            {isSignedIn && isTutor ? (
              <Alert tone="info" className="mt-6">
                Tutors cannot book sessions. Switch to a student account to request a lesson.
              </Alert>
            ) : null}

            <p className="mt-5 flex items-center gap-2 border-t border-ink-100 pt-4 text-xs text-ink-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              Rated {tutor.rating ? tutor.rating.toFixed(1) : '—'} by{' '}
              {tutor.reviewCount} learner{tutor.reviewCount === 1 ? '' : 's'}
            </p>
            <p className="mt-2 text-xs text-ink-500">
              {tutor.sessionCount} session{tutor.sessionCount === 1 ? '' : 's'} taught on Tutor UG
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
