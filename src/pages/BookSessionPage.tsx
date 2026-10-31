import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Info, Lock, Wallet } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Spinner';
import { StarRating } from '@/components/ui/StarRating';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { buildBookingSchema } from '@/utils/schemas';
import type { BookingFormValues } from '@/utils/schemas';
import { availabilityForDay, weekdayForDate } from '@/utils/availability';
import { firstName, formatRate, formatUGX, toDateInputValue } from '@/utils/format';

/** Half-hour slots from 08:00 to 20:00 East Africa Time. */
const TIME_SLOTS = Array.from({ length: 25 }, (_, index) => {
  const hours = String(8 + Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

export function BookSessionPage() {
  const { tutorId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: tutor, error: tutorError, loading: tutorLoading } = useAsyncData(
    () => services.tutors.get(tutorId),
    [tutorId],
  );
  const walletState = useAsyncData(() => services.wallet.getWallet(), []);
  const wallet = walletState.data;
  const sessionFee = tutor?.hourlyRate ?? 0;
  const needsTopUp = !!wallet && wallet.availableBalance < sessionFee;

  const today = useMemo(() => new Date(), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(buildBookingSchema(today)),
    mode: 'onBlur',
    defaultValues: {
      subject: '',
      date: '',
      time: '09:00',
      message: '',
    },
  });

  const subject = watch('subject');
  const date = watch('date');
  const selectedTime = watch('time');

  const hasSchedule = !!tutor?.availability?.some((slot) => slot.enabled);
  const availableTimes = useMemo(() => {
    if (!tutor || !hasSchedule || !date) return [];
    const times = availabilityForDay(tutor.availability, weekdayForDate(date));
    return TIME_SLOTS.filter((time) => times.includes(time));
  }, [tutor, date, hasSchedule]);

  // Default the subject to the tutor's first one.
  useEffect(() => {
    if (!tutor) return;
    if (!subject && tutor.subjects.length > 0) {
      setValue('subject', tutor.subjects[0]);
    }
  }, [tutor, subject, setValue]);

  useEffect(() => {
    if (!date || availableTimes.length === 0) return;
    if (!availableTimes.includes(selectedTime)) {
      setValue('time', availableTimes[0]);
    }
  }, [date, availableTimes, selectedTime, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (!hasSchedule) {
      setSubmitError('This tutor has not published any available times yet.');
      return;
    }

    if (!availableTimes.includes(values.time)) {
      setError('time', { message: "Choose one of the tutor's available times." });
      return;
    }

    try {
      const session = await services.sessions.create({
        tutorId,
        subject: values.subject.trim(),
        scheduledAt: `${values.date}T${values.time}:00`,
        message: values.message?.trim() ? values.message.trim() : undefined,
      });

      toast.success(
        'Request sent',
        `${tutor?.fullName ?? 'The tutor'} has been asked to confirm your session.`,
      );
      navigate(`/sessions/${session.id}`, { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      setSubmitError(appError.message);

      if (appError.fieldErrors.scheduledAt) {
        setError('date', { message: appError.fieldErrors.scheduledAt });
      }
      if (appError.fieldErrors.subject) {
        setError('subject', { message: appError.fieldErrors.subject });
      }
    }
  });

  if (tutorLoading) {
    return (
      <AppShell title="Book a session">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </AppShell>
    );
  }

  if (tutorError) {
    return (
      <AppShell title="Book a session">
        <Alert
          tone="error"
          title={tutorError.isNotFound ? 'Tutor not found' : 'We could not load this tutor'}
        >
          {tutorError.message}
        </Alert>
        <div className="mt-6">
          <ButtonLink to="/tutors" variant="ghost" leftIcon={ArrowLeft}>
            Back to all tutors
          </ButtonLink>
        </div>
      </AppShell>
    );
  }

  if (!tutor) return null;

  const displayName = tutor.fullName;
  const shortName = firstName(tutor.fullName);
  const noSchedule = !!tutor && !hasSchedule;
  const noTimesForDate = hasSchedule && !!date && availableTimes.length === 0;

  return (
    <AppShell title="Book a session">
    <div className="pb-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to={`/tutors/${tutor.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-[#7eb3ff]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to {displayName}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------- Form */}
        <Card className="min-w-0 p-5 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Request a session</h1>
          <p className="mt-2 text-sm text-white/60">
            Choose one of {shortName}&apos;s available times. Paying holds the session fee in escrow
            and unlocks chat with {shortName}.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
            {submitError ? (
              <Alert tone="error" title="We could not send your request">
                {submitError}
              </Alert>
            ) : null}

            <Select
              label="Subject"
              error={errors.subject?.message}
              required
              options={tutor.subjects.map((item) => ({ value: item, label: item }))}
              placeholder="Choose a subject"
              {...register('subject')}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                min={toDateInputValue(today)}
                error={errors.date?.message}
                required
                {...register('date')}
              />

              <Select
                label="Time"
                error={errors.time?.message}
                required
                disabled={!date || noSchedule}
                placeholder={hasSchedule && !date ? 'Pick a date first' : undefined}
                options={availableTimes.map((time) => ({ value: time, label: time }))}
                {...register('time')}
              />
            </div>

            {noSchedule ? (
              <Alert tone="warning" title="Availability not published">
                {firstName(tutor.fullName)} has not published any available times yet, so booking
                is not open. Check back later.
              </Alert>
            ) : date && tutor.availability && tutor.availability.length > 0 ? (
              availableTimes.length > 0 ? (
                <p className="flex items-start gap-2 text-xs text-volt-400">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Showing only times {shortName} is available on this day.
                </p>
              ) : (
                <Alert tone="warning" title="Not available on this day">
                  {firstName(tutor.fullName)} has not set any times for this day. Pick another
                  date.
                </Alert>
              )
            ) : null}

            <Textarea
              label="What would you like help with?"
              hint="Sharing the topic helps your tutor prepare. A couple of sentences is plenty."
              optional
              rows={5}
              placeholder="e.g. I am stuck on integration by parts and my MAT 1201 CAT is next week."
              error={errors.message?.message}
              {...register('message')}
            />

            <div className="flex flex-col gap-3 border-t border-[rgba(21,88,201,0.2)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs text-white/45">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Your wallet is charged now and the fee is held by TutorUG until the session is
                completed. Cancel before then for a full refund.
              </p>
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={needsTopUp || walletState.loading || noSchedule || noTimesForDate}
                leftIcon={CalendarClock}
                className="w-full sm:w-auto"
              >
                {needsTopUp
                  ? 'Top up to book'
                  : noSchedule
                    ? 'Not accepting bookings'
                    : noTimesForDate
                      ? 'Choose another date'
                      : isSubmitting
                        ? 'Processing payment…'
                        : 'Pay & request session'}
              </Button>
            </div>
          </form>
        </Card>

        {/* -------------------------------------------------- Tutor card */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Avatar name={tutor.fullName} src={tutor.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-white">{displayName}</p>
                <StarRating value={tutor.rating} size="xs" className="mt-1" />
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-300">
                  <Lock className="h-3 w-3" />
                  Chat unlocks after payment
                </p>
              </div>
            </div>

            {tutor.subjects.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {tutor.subjects.map((item) => (
                  <li key={item}>
                    <Badge tone="brand">{item}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 border-t border-[rgba(21,88,201,0.2)] pt-4">
              <p className="text-sm text-white/60">
                <span className="block text-xs text-white/45">Rate per session</span>
                <span className="text-lg font-bold text-white">{formatRate(tutor.hourlyRate)}</span>
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[rgba(212,255,36,0.08)] px-3 py-2.5 ring-1 ring-[rgba(212,255,36,0.25)]">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-volt-400">
                  <Wallet className="h-4 w-4" />
                  Wallet balance
                </span>
                <span className="text-sm font-bold text-volt-300">
                  {wallet ? formatUGX(wallet.availableBalance) : '—'}
                </span>
              </div>
              {needsTopUp && (
                <div className="mt-3 rounded-xl bg-[rgba(251,191,36,0.1)] p-3 text-xs text-amber-200 ring-1 ring-[rgba(251,191,36,0.3)]">
                  You need {formatUGX(sessionFee - (wallet?.availableBalance ?? 0))} more.{' '}
                  <Link to="/wallet" className="font-bold underline">
                    Top up your wallet
                  </Link>
                </div>
              )}
            </div>

            <ol className="mt-5 space-y-3 border-t border-[rgba(21,88,201,0.2)] pt-4">
              {[
                'You send this request and your wallet is charged.',
                'The tutor accepts or declines.',
                'TutorUG releases the fee after you both confirm the session.',
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-white/60">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[rgba(21,88,201,0.18)] text-xs font-bold text-[#7eb3ff]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
    </AppShell>
  );
}
