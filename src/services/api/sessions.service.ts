import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapList, mapSession } from './mappers';
import type { CreateSessionRequest, UpdateSessionStatusRequest } from '@/types/api';
import type { Session } from '@/types';

/** All sessions that belong to the authenticated user (student or tutor). */
export async function listMine(): Promise<Session[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.sessions.mine);
  return mapList(data, mapSession);
}

/** Load a single session with its tutor/student details. */
export async function get(id: string): Promise<Session> {
  const { data } = await apiClient.get(API_ENDPOINTS.sessions.byId(id));
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['session'] ?? record) as Record<string, unknown>;
  return mapSession(nested);
}

/** Request a tutoring session. */
export async function create(payload: CreateSessionRequest): Promise<Session> {
  const { data } = await apiClient.post(API_ENDPOINTS.sessions.create, payload);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['session'] ?? record) as Record<string, unknown>;
  return mapSession(nested);
}

/**
 * Move a session to a new state (accept / reject / complete / cancel).
 * The response is the authoritative session state.
 */
export async function updateStatus(
  id: string,
  status: UpdateSessionStatusRequest['status'],
  reason?: string,
): Promise<Session> {
  const body: UpdateSessionStatusRequest = { status };
  if (reason?.trim()) body.reason = reason.trim();

  const { data } = await apiClient.patch(API_ENDPOINTS.sessions.status(id), body);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['session'] ?? record) as Record<string, unknown>;
  return mapSession(nested);
}
