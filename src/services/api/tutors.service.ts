import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapList, mapPage, mapReview, mapTutor, mapTutorSummary } from './mappers';
import type { Page, Review, Tutor, TutorQuery, TutorSummary } from '@/types';

/** Search the tutor directory. Supports server-side filtering when available. */
export async function list(query: TutorQuery = {}): Promise<Page<TutorSummary>> {
  const params: Record<string, string | number> = {};

  if (query.search?.trim()) params['search'] = query.search.trim();
  if (query.subject?.trim()) params['subject'] = query.subject.trim();
  if (typeof query.minRating === 'number') params['minRating'] = query.minRating;
  if (typeof query.maxRate === 'number') params['maxRate'] = query.maxRate;
  if (typeof query.page === 'number') params['page'] = query.page;
  if (typeof query.size === 'number') params['size'] = query.size;

  const { data } = await apiClient.get(API_ENDPOINTS.tutors.list, { params });
  return mapPage(data, mapTutorSummary);
}

/** Load a single tutor profile. */
export async function get(id: string): Promise<Tutor> {
  const { data } = await apiClient.get(API_ENDPOINTS.tutors.byId(id));
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['tutor'] ?? record) as Record<string, unknown>;
  return mapTutor(nested);
}

/** Reviews written for a tutor. */
export async function getReviews(tutorId: string): Promise<Review[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.tutors.reviews(tutorId));
  return mapList(data, mapReview);
}

/** Distinct subjects offered by tutors (used to populate the filter control). */
export async function getSubjects(): Promise<string[]> {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.tutors.subjects);
    const record = (data ?? {}) as Record<string, unknown>;
    const raw =
      record['subjects'] ?? record['content'] ?? record['data'] ?? (Array.isArray(data) ? data : []);
    return mapList(raw, (item) =>
      typeof item === 'string' ? item : String((item as Record<string, unknown>)['name'] ?? ''),
    ).filter(Boolean);
  } catch {
    return [];
  }
}
