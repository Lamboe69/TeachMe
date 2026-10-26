import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarClock, Lock, MapPin, Search, Star } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { services } from '@/services';
import { availabilitySummary } from '@/utils/availability';
import { formatRate } from '@/utils/format';
import { Skeleton } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { TutorSummary } from '@/types';

const SUBJECTS = [
  'All',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'ICT',
  'Computer Studies',
  'English Literature',
  'Economics',
];

export function TutorsPageNew() {
  const [searchInput, setSearchInput] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const search = useDebouncedValue(searchInput, 300);

  const query = useMemo(
    () => ({
      search: search || undefined,
      subject: subjectFilter !== 'All' ? subjectFilter : undefined,
    }),
    [search, subjectFilter],
  );

  const { data, error, loading, reload } = useAsyncData(
    () => services.tutors.list(query),
    [query],
  );

  const tutors: TutorSummary[] = data?.content ?? [];

  return (
    <AppShell title="Find a tutor">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
          Find your{' '}
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            perfect tutor
          </span>
        </h2>
        <p className="mt-2 text-lg text-ink-700">
          Browse fellow students offering tutoring for course units. All payments secured by
          TutorUG.
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              placeholder="Search by name or course unit"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-300 pl-11 pr-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setSubjectFilter(subject)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  subjectFilter === subject
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'border border-ink-300 text-ink-700 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <Alert
          tone="error"
          title="We could not load tutors"
          action={
            <Button variant="outline" size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6">
            <p className="text-sm font-semibold text-ink-700">
              {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {tutors.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
              <Search className="mx-auto h-12 w-12 text-ink-400" />
              <p className="mt-4 font-semibold text-ink-900">No tutors found</p>
              <p className="mt-1 text-sm text-ink-600">Try a different subject or search term</p>
              <button
                onClick={() => {
                  setSearchInput('');
                  setSubjectFilter('All');
                }}
                className="mt-4 rounded-xl border border-ink-300 px-6 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => {
                const availability = availabilitySummary(tutor.availability);
                return (
                <div
                  key={tutor.id}
                  className="group rounded-2xl bg-white shadow-lg ring-1 ring-green-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-xl font-bold text-white">
                        {tutor.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-lg font-bold text-ink-950">{tutor.fullName}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-ink-900">
                            {tutor.rating != null ? tutor.rating.toFixed(1) : 'New'}
                          </span>
                          <span className="text-sm text-ink-600">({tutor.reviewCount})</span>
                        </div>
                        {tutor.location && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{tutor.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {tutor.subjects.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {tutor.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}

                    {tutor.bio ? (
                      <p className="mb-4 line-clamp-2 text-sm text-ink-700">{tutor.bio}</p>
                    ) : null}

                    <div className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800 ring-1 ring-green-200">
                      <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{availability ?? 'No weekly schedule published yet'}</span>
                    </div>

                    <div className="mb-4 flex items-center justify-between border-t border-green-100 pt-4">
                      <div>
                        <p className="text-xl font-black text-ink-950">
                          {formatRate(tutor.hourlyRate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-ink-600">
                        <BookOpen className="h-4 w-4" />
                        {tutor.sessionCount} sessions
                      </div>
                    </div>

                    <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                      <Lock className="h-3 w-3" />
                      Chat and booking unlock after you pay the session fee
                    </p>

                    <Link
                      to={`/tutors/${tutor.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-bold text-white transition hover:shadow-lg"
                    >
                      View profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
