import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Filter, GraduationCap, Home, Search, SearchX, SlidersHorizontal, User, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { TutorCard } from '@/components/tutor/TutorCard';
import { useTutorDirectory } from '@/hooks/useTutorDirectory';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { formatUGX } from '@/utils/format';

export function TutorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, updateFilter, resetFilters, hasActiveFilters, tutors, total, loading, error, reload } =
    useTutorDirectory();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: subjects } = useAsyncData(() => services.tutors.getSubjects(), []);

  // Seed the subject filter from the URL (?subject=Mathematics).
  useEffect(() => {
    const subject = searchParams.get('subject');
    if (subject && subject !== filters.subject) {
      updateFilter('subject', subject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleReset = () => {
    resetFilters();
    setSearchParams({});
  };

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
            <Link to="/student/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-700 hover:bg-ink-50">
              <Calendar className="h-5 w-5" />
              Sessions
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
              eyebrow="Tutor directory"
              title="Find a tutor"
              description="Browse fellow university students offering tutoring for course units. Compare rates, reviews and book a session."
            />

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* ------------------------------------------------------ Filters */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-ink-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <SlidersHorizontal className="h-4 w-4 text-green-600" aria-hidden="true" />
                Filters
              </h2>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-green-700 hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-4 space-y-4">
              <Input
                label="Search"
                type="search"
                placeholder="Name or subject"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
              />

              <Select
                label="Subject"
                value={filters.subject}
                onChange={(event) => updateFilter('subject', event.target.value)}
                placeholder="All subjects"
                options={(subjects ?? []).map((subject) => ({ value: subject, label: subject }))}
              />

              <Select
                label="Maximum session rate"
                value={filters.maxRate}
                onChange={(event) => updateFilter('maxRate', event.target.value)}
                placeholder="Any rate"
                options={[
                  { value: '30000', label: `Up to ${formatUGX(30000)}` },
                  { value: '50000', label: `Up to ${formatUGX(50000)}` },
                  { value: '75000', label: `Up to ${formatUGX(75000)}` },
                  { value: '100000', label: `Up to ${formatUGX(100000)}` },
                ]}
              />

              <Select
                label="Minimum rating"
                value={filters.minRating}
                onChange={(event) => updateFilter('minRating', event.target.value)}
                placeholder="Any rating"
                options={[
                  { value: '4', label: '4 stars and above' },
                  { value: '4.5', label: '4.5 stars and above' },
                  { value: '4.8', label: '4.8 stars and above' },
                ]}
              />
            </div>
          </div>

          <p className="mt-4 hidden rounded-xl bg-green-50 p-4 text-xs leading-relaxed text-green-900 lg:block">
            Tutors set their own rate per session. Payment is held securely by TutorUG until
            your session is complete.
          </p>
        </aside>

        {/* ------------------------------------------------------ Results */}
        <section aria-label="Tutors" className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-600" aria-live="polite">
              {loading
                ? 'Searching tutors…'
                : `${tutors.length} tutor${tutors.length === 1 ? '' : 's'} found${
                    total > tutors.length ? ` of ${total}` : ''
                  }`}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              leftIcon={Filter}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              Filters
            </Button>
          </div>

          {filtersOpen ? (
            <div className="mb-5 rounded-card border border-ink-200/80 bg-white p-5 shadow-card lg:hidden">
              <div className="space-y-4">
                <Input
                  label="Search"
                  type="search"
                  placeholder="Name or subject"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                />
                <Select
                  label="Subject"
                  value={filters.subject}
                  onChange={(event) => updateFilter('subject', event.target.value)}
                  placeholder="All subjects"
                  options={(subjects ?? []).map((subject) => ({
                    value: subject,
                    label: subject,
                  }))}
                />
                <Select
                  label="Maximum session rate"
                  value={filters.maxRate}
                  onChange={(event) => updateFilter('maxRate', event.target.value)}
                  placeholder="Any rate"
                  options={[
                    { value: '30000', label: `Up to ${formatUGX(30000)}` },
                    { value: '50000', label: `Up to ${formatUGX(50000)}` },
                    { value: '100000', label: `Up to ${formatUGX(100000)}` },
                  ]}
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={X}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <Alert
              tone="error"
              title="We could not load the tutor directory"
              action={
                <Button variant="outline" size="sm" onClick={reload}>
                  Try again
                </Button>
              }
            >
              {error.message}
            </Alert>
          ) : null}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-card border border-ink-200/80 bg-white p-5 shadow-card"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-6 w-2/3" />
                  <Skeleton className="mt-4 h-16 w-full" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !error && tutors.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-10 w-10" aria-hidden="true" />}
              title="No tutors match your search"
              description="Try a different subject, widen your price range, or clear the filters to see every available tutor."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={handleReset} leftIcon={X}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : null}

          {!loading && !error && tutors.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          ) : null}

          {!loading && !error && tutors.length === 0 && !hasActiveFilters ? (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-500">
              <Search className="h-4 w-4" aria-hidden="true" />
              The directory is currently empty.
            </p>
          ) : null}
        </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
