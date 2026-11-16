import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, BookOpen, CalendarClock, Lock, MapPin, Search, ShieldCheck, SlidersHorizontal, Star, X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDismissible } from '@/hooks/useDismissible';
import { services } from '@/services';
import { availabilitySummary } from '@/utils/availability';
import { formatRate } from '@/utils/format';
import { Skeleton } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { TutorSummary } from '@/types';

const VOLT = '#D4FF24';
const AVATAR_COLORS = ['#1558C9', '#7c3aed', '#0891b2', '#b45309', '#be185d', '#065f46'];
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const selectStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(21,88,201,0.4)',
  colorScheme: 'dark' as const,
};

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'sessions', label: 'Most sessions' },
];
const PRICES = [
  { value: 'any', label: 'Any price' },
  { value: '10000', label: 'Up to UGX 10,000' },
  { value: '15000', label: 'Up to UGX 15,000' },
  { value: '20000', label: 'Up to UGX 20,000' },
];
const RATINGS = [
  { value: 'any', label: 'Any rating' },
  { value: '4.5', label: '4.5 & up' },
  { value: '4.0', label: '4.0 & up' },
];

function avatarBg(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function sortTutors(tutors: TutorSummary[], key: string): TutorSummary[] {
  const copy = [...tutors];
  switch (key) {
    case 'rating':
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'price-asc':
      copy.sort((a, b) => a.hourlyRate - b.hourlyRate);
      break;
    case 'price-desc':
      copy.sort((a, b) => b.hourlyRate - a.hourlyRate);
      break;
    case 'sessions':
      copy.sort((a, b) => b.sessionCount - a.sessionCount);
      break;
    default:
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.sessionCount - a.sessionCount);
  }
  return copy;
}

export function TutorsPageNew() {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [subjectFilter, setSubjectFilter] = useState(() => searchParams.get('subject') ?? 'All');
  const [sortKey, setSortKey] = useState('recommended');
  const [maxPrice, setMaxPrice] = useState('any');
  const [minRating, setMinRating] = useState('any');
  const search = useDebouncedValue(searchInput, 300);
  const { dismissed, dismiss } = useDismissible('tutorug.tutors.escrowTip');

  const query = useMemo(() => ({
    search: search || undefined,
    subject: subjectFilter !== 'All' ? subjectFilter : undefined,
  }), [search, subjectFilter]);

  const { data, error, loading, reload } = useAsyncData(() => services.tutors.list(query), [query]);
  const subjectsState = useAsyncData(() => services.tutors.getSubjects(), []);
  const tutors: TutorSummary[] = useMemo(() => data?.content ?? [], [data]);

  const subjectOptions = useMemo(() => {
    const all = subjectsState.data ?? [];
    if (subjectFilter !== 'All' && !all.includes(subjectFilter)) return [subjectFilter, ...all];
    return all;
  }, [subjectsState.data, subjectFilter]);

  const visible = useMemo(() => {
    const priceCeiling = maxPrice === 'any' ? null : Number(maxPrice);
    const ratingFloor = minRating === 'any' ? null : Number(minRating);
    const filtered = tutors.filter(
      (tutor) =>
        (priceCeiling === null || tutor.hourlyRate <= priceCeiling) &&
        (ratingFloor === null || (tutor.rating ?? 0) >= ratingFloor),
    );
    return sortTutors(filtered, sortKey);
  }, [tutors, maxPrice, minRating, sortKey]);

  const filtersActive = searchInput.trim() !== '' || subjectFilter !== 'All' || maxPrice !== 'any' || minRating !== 'any';
  const clearFilters = () => {
    setSearchInput('');
    setSubjectFilter('All');
    setMaxPrice('any');
    setMinRating('any');
    setSortKey('recommended');
  };

  return (
    <AppShell title="Find a tutor">
      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 text-sm font-semibold" style={{ color: VOLT }}>Peer tutoring</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Find your perfect tutor
        </h2>
        <p className="mt-2 max-w-2xl text-white/55">
          Browse fellow university students offering tutoring for course units. Filter by course unit, price and rating — all payments secured by TutorUG.
        </p>
      </div>

      {/* Escrow reassurance (learn once, dismissible) */}
      {!dismissed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: VOLT }} />
          <p className="min-w-0 flex-1 text-sm text-white/70">
            <span className="font-bold text-white">Your money is protected.</span>{' '}
            When you book, the fee is held in escrow by TutorUG and only released once the session is done.{' '}
            <Link to="/help" className="font-bold" style={{ color: VOLT }}>How it works →</Link>
          </p>
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="mb-6 rounded-2xl p-5" style={cardStyle}>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="Search by name, course unit or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 w-full rounded-xl pl-11 pr-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' }}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['All', ...subjectOptions].map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setSubjectFilter(subject)}
              aria-pressed={subjectFilter === subject}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition"
              style={subjectFilter === subject
                ? { background: VOLT, color: '#030407' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(21,88,201,0.35)', color: 'rgba(255,255,255,0.6)' }
              }
            >
              {subject}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Refine
        </div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <select
            aria-label="Sort tutors by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="h-11 rounded-xl px-3 text-sm font-semibold text-white outline-none transition focus:ring-2 focus:ring-[#1558C9]"
            style={selectStyle}
          >
            {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            aria-label="Maximum price per session"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-11 rounded-xl px-3 text-sm font-semibold text-white outline-none transition focus:ring-2 focus:ring-[#1558C9]"
            style={selectStyle}
          >
            {PRICES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select
            aria-label="Minimum tutor rating"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="h-11 rounded-xl px-3 text-sm font-semibold text-white outline-none transition focus:ring-2 focus:ring-[#1558C9]"
            style={selectStyle}
          >
            {RATINGS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        {filtersActive && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-white/40">Filters applied to your search</p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold transition hover:opacity-80"
              style={{ color: VOLT }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <Alert tone="error" title="We could not load tutors" action={<Button variant="outline" size="sm" onClick={reload}>Try again</Button>}>
          {error.message}
        </Alert>
      )}

      {loading && !data && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {data && !error && (
        <>
          <p aria-live="polite" className="mb-5 text-sm font-semibold text-white/50">
            {visible.length} tutor{visible.length !== 1 ? 's' : ''} found
          </p>

          {visible.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={cardStyle}>
              <Search className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 font-semibold text-white">No tutors match your filters</p>
              <p className="mt-1 text-sm text-white/50">Try widening the price or rating, or a different course unit.</p>
              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl px-6 py-2 text-sm font-semibold transition hover:opacity-80"
                style={{ background: 'rgba(21,88,201,0.3)', border: '1px solid rgba(21,88,201,0.5)', color: 'white' }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((tutor) => {
                const availability = availabilitySummary(tutor.availability);
                const bg = avatarBg(tutor.fullName);
                return (
                  <div
                    key={tutor.id}
                    data-testid="tutor-card"
                    className="rounded-2xl overflow-hidden"
                    style={{ ...cardStyle, transition: 'border 0.15s, box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.border = '1px solid rgba(21,88,201,0.7)';
                      el.style.boxShadow = '0 0 28px rgba(21,88,201,0.22), inset 0 2px 0 #1558C9';
                      el.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.border = '1px solid rgba(21,88,201,0.25)';
                      el.style.boxShadow = 'none';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="p-6">
                      {/* Avatar + name */}
                      <div className="mb-4 flex items-start gap-4">
                        <div
                          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-lg font-black"
                          style={{ background: `linear-gradient(135deg, ${bg}, ${bg}99)`, color: VOLT, boxShadow: `0 0 20px ${bg}55` }}
                        >
                          {initials(tutor.fullName)}
                          {tutor.rating != null && tutor.rating >= 4.8 && (
                            <span className="absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[9px] font-black" style={{ background: VOLT, color: '#030407' }}>TOP</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-base font-bold text-white">{tutor.fullName}</h3>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-current" style={{ color: VOLT }} />
                            <span className="text-sm font-bold text-white">
                              {tutor.rating != null ? tutor.rating.toFixed(1) : 'New'}
                            </span>
                            <span className="text-xs text-white/40">({tutor.reviewCount})</span>
                          </div>
                          {tutor.location && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-white/50">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{tutor.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subjects */}
                      {tutor.subjects.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {tutor.subjects.map((subject) => (
                            <span key={subject} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.25)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(21,88,201,0.4)' }}>
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}

                      {tutor.bio && (
                        <p className="mb-3 line-clamp-2 text-xs text-white/50">{tutor.bio}</p>
                      )}

                      {/* Availability */}
                      <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.15)', color: 'rgba(212,255,36,0.8)' }}>
                        <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{availability ?? 'No weekly schedule published yet'}</span>
                      </div>

                      {/* Rate + stats */}
                      <div className="mb-4 flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
                        <p className="text-lg font-black text-white">{formatRate(tutor.hourlyRate)}</p>
                        <div className="flex flex-col items-end gap-0.5 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {tutor.sessionCount} sessions
                          </span>
                          {tutor.yearsExperience ? <span>{tutor.yearsExperience} yrs experience</span> : null}
                        </div>
                      </div>

                      <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-white/30">
                        <Lock className="h-3 w-3" />
                        Chat unlocks after booking
                      </p>

                      <Link
                        to={`/tutors/${tutor.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150 hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #D4FF24, #b8e600)', color: '#030407', boxShadow: '0 4px 16px rgba(212,255,36,0.25)' }}
                      >
                        View profile <ArrowRight className="h-4 w-4" />
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
