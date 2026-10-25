import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapReview } from './mappers';
import type { CreateReviewRequest } from '@/types/api';
import type { Review } from '@/types';

/**
 * Submit a review for a completed session.
 * The backend decides whether the session is eligible — the client only
 * guards the UI.
 */
export async function create(
  sessionId: string,
  payload: CreateReviewRequest,
): Promise<Review> {
  const { data } = await apiClient.post(API_ENDPOINTS.sessions.reviews(sessionId), payload);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['review'] ?? record) as Record<string, unknown>;
  return mapReview(nested);
}
