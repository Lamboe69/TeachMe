import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapList, mapSession, mapSessionMessage } from './mappers';
import type { CreateSessionRequest, UpdateSessionStatusRequest } from '@/types/api';
import type { Session, SessionMessage } from '@/types';

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

/** Messages for a paid session. Only participants can read them. */
export async function listMessages(sessionId: string): Promise<SessionMessage[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.sessions.messages(sessionId));
  return mapList(data, mapSessionMessage);
}

/** Send a message to the other party after the session fee is paid. */
export async function sendMessage(sessionId: string, body: string): Promise<SessionMessage> {
  const { data } = await apiClient.post(API_ENDPOINTS.sessions.messages(sessionId), { body });
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['message'] ?? record) as Record<string, unknown>;
  return mapSessionMessage(nested);
}
