import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapUser } from './mappers';
import type { UpdateProfileRequest } from '@/types/api';
import type { User } from '@/types';

/** Load the profile of the authenticated user. */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get(API_ENDPOINTS.users.me);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['user'] ?? record) as Record<string, unknown>;
  return mapUser(nested);
}

/** Update the authenticated user's profile. */
export async function updateMe(payload: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.patch(API_ENDPOINTS.users.updateMe, payload);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['user'] ?? record) as Record<string, unknown>;
  return mapUser(nested);
}
