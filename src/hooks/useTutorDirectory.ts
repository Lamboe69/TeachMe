import { useCallback, useMemo, useState } from 'react';
import { services } from '@/services';
import { useAsyncData } from './useAsyncData';
import { useDebouncedValue } from './useDebouncedValue';
import type { TutorQuery, TutorSummary } from '@/types';

export interface TutorFilters {
  search: string;
  subject: string;
  maxRate: string;
  minRating: string;
}

/**
 * Tutor directory state: search text, filters and the resulting list.
 * The search term is debounced so typing does not spam the API.
 */
export function useTutorDirectory() {
  const [filters, setFilters] = useState<TutorFilters>({
    search: '',
    subject: '',
    maxRate: '',
    minRating: '',
  });

  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const query = useMemo<TutorQuery>(() => {
    const next: TutorQuery = {};
    if (debouncedSearch.trim()) next.search = debouncedSearch.trim();
    if (filters.subject.trim()) next.subject = filters.subject.trim();
    if (filters.maxRate.trim()) {
      const value = Number(filters.maxRate);
      if (Number.isFinite(value) && value > 0) next.maxRate = value;
    }
    if (filters.minRating.trim()) {
      const value = Number(filters.minRating);
      if (Number.isFinite(value) && value > 0) next.minRating = value;
    }
    return next;
  }, [debouncedSearch, filters.subject, filters.maxRate, filters.minRating]);

  const { data, error, loading, reload } = useAsyncData(
    () => services.tutors.list(query),
    [JSON.stringify(query)],
  );

  const tutors: TutorSummary[] = data?.content ?? [];

  const updateFilter = useCallback(<K extends keyof TutorFilters>(key: K, value: TutorFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', subject: '', maxRate: '', minRating: '' });
  }, []);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.subject.trim() !== '' ||
    filters.maxRate.trim() !== '' ||
    filters.minRating.trim() !== '';

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    tutors,
    total: data?.totalElements ?? 0,
    loading,
    error,
    reload,
  };
}
