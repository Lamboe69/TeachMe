import { throwAppError } from '@/utils/apiError';
import type { CreateReviewRequest } from '@/types/api';
import type { Review } from '@/types';
import { createId, findTutorById, getDb, saveDb } from './db';

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function create(sessionId: string, payload: CreateReviewRequest): Promise<Review> {
  await delay(600);

  const db = getDb();
  if (!db.currentUserId) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  const userId = db.currentUserId;

  const session = db.sessions.find((entry) => entry.id === sessionId);
  if (!session) {
    throwAppError(404, 'We could not find that session.');
  }
  if (session.student.id !== userId) {
    throwAppError(403, 'Only the student who attended this session can review it.');
  }
  if (session.status !== 'COMPLETED') {
    throwAppError(409, 'You can only review a session once it has been completed.');
  }
  if (db.reviews.some((review) => review.sessionId === sessionId)) {
    throwAppError(409, 'You have already reviewed this session.');
  }
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    throwAppError(400, 'Please choose a rating between 1 and 5 stars.', {
      rating: 'Please choose a rating between 1 and 5 stars.',
    });
  }
  if (!payload.comment.trim()) {
    throwAppError(400, 'Please write a short review.', {
      comment: 'Please write a short review.',
    });
  }

  const review: Review = {
    id: createId('review'),
    sessionId,
    tutorId: session.tutor.id,
    studentId: userId,
    studentName: session.student.fullName,
    rating: payload.rating,
    comment: payload.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(review);
  session.hasReview = true;
  session.reviewId = review.id;
  saveDb();

  const tutor = findTutorById(session.tutor.id);
  if (tutor) {
    const tutorReviews = db.reviews.filter((entry) => entry.tutorId === tutor.id);
    tutor.reviewCount = tutorReviews.length;
    tutor.rating =
      Math.round((tutorReviews.reduce((sum, entry) => sum + entry.rating, 0) / tutorReviews.length) * 10) /
      10;
  }

  return review;
}
