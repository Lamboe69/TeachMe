import { AUTH_MODE } from '@/app/config';

/**
 * Bearer-token storage (only used when the backend is configured with
 * `VITE_AUTH_MODE=bearer`).
 *
 * - The token is held in memory for the lifetime of the tab.
 * - It is mirrored into `sessionStorage` (tab-scoped, cleared when the tab
 *   closes) purely so a page refresh does not log the user out.
 * - Passwords are never stored. `localStorage` is never used for secrets.
 *
 * In the default `cookie` auth mode this module is unused: the backend sets
 * an HttpOnly cookie and JavaScript never reads it.
 */

const STORAGE_KEY = 'tutorug.access-token';

let accessToken: string | null = null;
let hydrated = false;

function safeSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (AUTH_MODE !== 'bearer') return null;
  if (accessToken) return accessToken;
  if (!hydrated) {
    hydrated = true;
    try {
      accessToken = safeSessionStorage()?.getItem(STORAGE_KEY) ?? null;
    } catch {
      accessToken = null;
    }
  }
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  if (AUTH_MODE !== 'bearer') return;
  accessToken = token;
  hydrated = true;
  try {
    const store = safeSessionStorage();
    if (!store) return;
    if (token) store.setItem(STORAGE_KEY, token);
    else store.removeItem(STORAGE_KEY);
  } catch {
    /* Storage unavailable (private mode) — the in-memory token still works. */
  }
}

export function clearAccessToken(): void {
  accessToken = null;
  hydrated = true;
  try {
    safeSessionStorage()?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
