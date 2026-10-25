import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL, API_CREDENTIALS, API_TIMEOUT } from '@/app/config';
import { clearAccessToken, getAccessToken } from './tokenStore';

/**
 * Centralised Axios instance.
 *
 * `withCredentials` is enabled whenever the app is configured for cookie
 * based auth so the HttpOnly session cookie travels with every request.
 * In bearer mode the `Authorization` header is attached automatically.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: API_CREDENTIALS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/** Called by the auth provider when a request fails with 401. */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

/** URL for an absolute path, useful for links to backend resources. */
export function absoluteApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
