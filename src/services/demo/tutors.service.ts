import { throwAppError } from '@/utils/apiError';
import type { Page, Review, Tutor, TutorQuery, TutorSummary } from '@/types';
import { getDb } from './db';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function matches(tutor: TutorSummary, query: TutorQuery): boolean {
  const search = query.search?.trim().toLowerCase();
  if (search) {
    const haystack = [tutor.fullName, tutor.bio ?? '', tutor.subjects.join(' '), tutor.location ?? '']
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  if (query.subject?.trim()) {
    const wanted = query.subject.trim().toLowerCase();
    const hasSubject = tutor.subjects.some((subject) => subject.toLowerCase() === wanted);
    if (!hasSubject) return false;
  }

  if (typeof query.minRating === 'number' && (tutor.rating ?? 0) < query.minRating) return false;
  if (typeof query.maxRate === 'number' && tutor.hourlyRate > query.maxRate) return false;

  return true;
}

export async function list(query: TutorQuery = {}): Promise<Page<TutorSummary>> {
  await delay();
  const db = getDb();
  const filtered = db.tutors.filter((tutor) => matches(tutor, query));

  const page = query.page ?? 0;
  const size = query.size ?? (filtered.length || 1);
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    number: page,
    size,
  };
}

export async function get(id: string): Promise<Tutor> {
  await delay(300);
  const db = getDb();
  const tutor = db.tutors.find((entry) => entry.id === id);
  if (!tutor) {
    throwAppError(404, 'We could not find that tutor. They may no longer be on Tutor UG.');
  }
  const reviews = db.reviews.filter((review) => review.tutorId === tutor.id);
  return {
    ...tutor,
    rating:
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) /
          10
        : tutor.rating,
    reviewCount: reviews.length || tutor.reviewCount,
    reviews,
  };
}

export async function getReviews(tutorId: string): Promise<Review[]> {
  await delay(250);
  const db = getDb();
  return db.reviews.filter((review) => review.tutorId === tutorId);
}

export async function getSubjects(): Promise<string[]> {
  await delay(150);
  const db = getDb();
  const subjects = new Set<string>();
  db.tutors.forEach((tutor) => tutor.subjects.forEach((subject) => subjects.add(subject)));
  return Array.from(subjects).sort();
}
