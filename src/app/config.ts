/**
 * Runtime configuration, driven entirely by Vite environment variables.
 * See `.env.example` for the documented contract.
 */

const env = import.meta.env;

function readBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') return fallback;
  return value.trim().toLowerCase() === 'true' || value.trim() === '1';
}

function readString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Base URL of the Spring Boot REST API, without a trailing slash. */
export const API_BASE_URL = readString(env.VITE_API_BASE_URL, 'http://localhost:8080').replace(
  /\/+$/,
  '',
);

/**
 * When true the app talks to the in-browser mock services instead of the
 * Spring Boot API. Demo mode is always surfaced visibly in the UI.
 *
 * Defaults to `true`: the product runs against sample data until the backend
 * is wired up. Set `VITE_DEMO_MODE=false` (and `VITE_API_BASE_URL`) once the
 * Spring Boot API is live — no component changes are required.
 */
export const DEMO_MODE = readBool(env.VITE_DEMO_MODE, true);

/**
 * Authentication strategy agreed with the backend.
 *
 * - `cookie` (default): the backend sets an HttpOnly, Secure cookie.
 *   The client never reads it; it only sends credentials with every request
 *   and re-establishes the session with `GET /api/auth/me` on load.
 * - `bearer`: the backend returns a token in the login response body. The
 *   token is kept in memory (and mirrored to `sessionStorage`, which is
 *   tab-scoped) so a page refresh keeps the user signed in. Passwords and
 *   long-lived secrets are never written to `localStorage`.
 */
export const AUTH_MODE: 'cookie' | 'bearer' =
  env.VITE_AUTH_MODE?.trim().toLowerCase() === 'bearer' ? 'bearer' : 'cookie';

/** Request timeout in milliseconds. */
export const API_TIMEOUT = Number(readString(env.VITE_API_TIMEOUT, '20000'));

/**
 * Whether the backend exposes a password-reset request endpoint.
 *
 * This is NOT part of the agreed MVP contract. It stays off by default so
 * the app never pretends a reset email was sent. Turn it on once the Spring
 * Boot team confirms `POST /api/auth/forgot-password` exists.
 */
export const PASSWORD_RESET_ENABLED = readBool(env.VITE_PASSWORD_RESET_ENABLED, false);

/** Optional comma separated list of CORS origins allowed to call the API. */
export const API_CREDENTIALS = AUTH_MODE === 'cookie';

/**
 * Platform commission taken from each completed session before the tutor's
 * earnings are released to their wallet. Configurable so finance can adjust
 * it without a code change; defaults to 15%.
 */
export const PLATFORM_FEE_PERCENT = Math.min(
  50,
  Math.max(0, Number(readString(env.VITE_PLATFORM_FEE_PERCENT, '15')) || 15),
);

export const APP_NAME = 'Tutor UG';
