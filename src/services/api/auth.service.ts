import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { mapUser } from './mappers';
import { setAccessToken } from './tokenStore';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api';
import type { User } from '@/types';

/** Pull a token out of the login response, tolerating several common shapes. */
function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record['token'],
    record['accessToken'],
    record['access_token'],
    record['jwt'],
    (record['data'] as Record<string, unknown> | undefined)?.['token'],
    (record['data'] as Record<string, unknown> | undefined)?.['accessToken'],
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

/**
 * Register a new account.
 *
 * The backend decides what happens after registration. If it returns a token
 * we keep the user signed in; otherwise the user is sent to the login page
 * with a success message. We never fake a session.
 */
export async function register(payload: RegisterRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post(API_ENDPOINTS.auth.register, payload);

  const token = extractToken(data);
  if (token) setAccessToken(token);

  const record = (data ?? {}) as Record<string, unknown>;
  const userDto = (record['user'] ?? record['data'] ?? record) as Record<string, unknown>;
  const user = mapUser(userDto);

  return {
    token,
    userId: user.id || null,
    role: user.role,
    raw: record,
  };
}

/** Authenticate and store the session according to the configured auth mode. */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post(API_ENDPOINTS.auth.login, payload);

  const token = extractToken(data);
  if (token) setAccessToken(token);

  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['user'] ?? record) as Record<string, unknown>;
  const user = mapUser(nested);

  return {
    token,
    userId: user.id || null,
    role: user.role,
    raw: record,
  };
}

/** Load the currently authenticated user. Throws 401 when the session expired. */
export async function me(): Promise<User> {
  const { data } = await apiClient.get(API_ENDPOINTS.auth.me);
  const record = (data ?? {}) as Record<string, unknown>;
  const nested = (record['data'] ?? record['user'] ?? record) as Record<string, unknown>;
  return mapUser(nested);
}

/** Best-effort server-side session termination. */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  } catch {
    // The client session is cleared regardless of the server response.
  }
}

/**
 * Request a password reset link.
 *
 * Only available once the backend implements
 * `POST /api/auth/forgot-password`. If the endpoint is missing the backend
 * answers 404 and we surface an honest "not supported" message instead of
 * pretending an email was sent.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { data } = await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
  return data;
}
