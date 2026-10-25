import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldAlert, Star } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Spinner';
import { StarInput } from '@/components/ui/StarRating';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { feedbackSchema } from '@/utils/schemas';
import type { FeedbackFormValues } from '@/utils/schemas';
import { formatDateTime } from '@/utils/format';

export function FeedbackPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: session, error, loading, reload } = useAsyncData(
    () => services.sessions.get(id),
    [id],
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    mode: 'onBlur',
    defaultValues: { rating: 0, comment: '' },
  });

  const rating = watch('rating');

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await services.reviews.create(id, {
        rating: values.rating,
        comment: values.comment.trim(),
      });
      toast.success('Thanks for your review', 'Your feedback helps other learners and tutors.');
      navigate(`/sessions/${id}`, { replace: true });
    } catch (caught) {
      const appError = toAppError(caught);
      setSubmitError(appError.message);
      if (appError.fieldErrors.rating) {
        setError('rating', { message: appError.fieldErrors.rating });
      }
      if (appError.fieldErrors.comment) {
        setError('comment', { message: appError.fieldErrors.comment });
      }
    }
  });

  if (loading) {
    return (
      <div className="container-page py-10 sm:py-14">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-96 w-full rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10 sm:py-14">
        <Alert
          tone={error.isForbidden ? 'warning' : 'error'}
          title={
            error.isForbidden
              ? 'You do not have access to this session'
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
    );
  }

  if (!session) return null;

  // ------------------------------------------------------------ Eligibility
  if (session.status !== 'COMPLETED') {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="container-narrow">
          <Card className="p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-ink-900">This session is not complete yet</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Reviews can only be left once a session has been completed. This session is currently{' '}
              <strong>{session.status.toLowerCase()}</strong>.
            </p>
            <ButtonLink to={`/sessions/${session.id}`} className="mt-6">
              Back to the session
            </ButtonLink>
          </Card>
        </div>
      </div>
    );
  }

  if (session.hasReview) {
    return (
      <div className="container-page py-10 sm:py-14">
        <div className="container-narrow">
          <Card className="p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-50 text-accent-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-ink-900">You already reviewed this session</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              Only one review can be submitted per session. Thank you for helping other learners.
            </p>
            <ButtonLink to={`/sessions/${session.id}`} className="mt-6">
              Back to the session
            </ButtonLink>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------- The form
  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to={`/sessions/${session.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the session
        </Link>
      </nav>

      <div className="container-narrow">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Rate your session</h1>
          <p className="mt-2 text-sm text-ink-600">
            Your review helps other learners choose a tutor and helps tutors improve.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink-50 p-4">
            <Avatar name={session.tutor.fullName} src={session.tutor.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{session.tutor.fullName}</p>
              <p className="truncate text-xs text-ink-500">
                {session.subject} · {formatDateTime(session.scheduledAt)}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
            {submitError ? (
              <Alert tone="error" title="We could not save your review">
                {submitError}
              </Alert>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-800">
                How was your session?{' '}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
              </p>
              <StarInput
                value={rating}
                onChange={(value) => setValue('rating', value, { shouldValidate: true })}
                error={errors.rating?.message}
              />
            </div>

            <Textarea
              label="Write your review"
              hint="What did the tutor do well? What should other learners expect?"
              rows={6}
              placeholder="e.g. The tutor explained quadratic equations clearly and gave me plenty of practice questions..."
              error={errors.comment?.message}
              {...register('comment')}
            />

            <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs text-ink-500">
                <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Reviews are published against the tutor&apos;s profile.
              </p>
              <Button type="submit" size="lg" loading={isSubmitting}>
                {isSubmitting ? 'Submitting review…' : 'Submit review'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
