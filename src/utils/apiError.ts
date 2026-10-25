import { AxiosError } from 'axios';

/**
 * A normalised, user-safe error.
 *
 * `message` is always safe to render in the UI: it never contains raw
 * server stack traces, tokens or credentials.
 */
export interface AppError {
  /** HTTP status code, or 0 when the request never reached the server. */
  status: number;
  /** Human readable, user-safe message. */
  message: string;
  /** Optional per-field validation messages keyed by field name. */
  fieldErrors: Record<string, string>;
  /** True when the request failed because of a network / CORS / offline issue. */
  isNetworkError: boolean;
  /** True when the server rejected the credentials (401). */
  isUnauthorized: boolean;
  /** True when the server refused the action for this user (403). */
  isForbidden: boolean;
  /** True when the server reported a validation failure (400 / 422). */
  isValidationError: boolean;
  /** True when the requested resource does not exist (404). */
  isNotFound: boolean;
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'The information submitted is not valid. Please check the highlighted fields.',
  401: 'Your session has expired or your credentials are incorrect. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'That action conflicts with the current state of this request. Please refresh and try again.',
  422: 'The information submitted is not valid. Please check the highlighted fields.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again shortly.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

export function defaultErrorMessage(status: number): string {
  return DEFAULT_MESSAGES[status] ?? 'Something went wrong. Please try again.';
}

/** Pull a user-safe message out of an arbitrary server error payload. */
function extractServerMessage(payload: unknown): string | null {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed) return null;
    // Only surface short human-readable strings; skip stack traces / HTML.
    if (trimmed.length > 300) return null;
    if (trimmed.startsWith('<') || trimmed.includes('\n    at ')) return null;
    return trimmed;
  }

  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const candidates = [
    record['message'],
    record['error'],
    record['detail'],
    record['title'],
    (record['errors'] as Record<string, unknown> | undefined)?.['message'],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() && candidate.trim().length <= 300) {
      return candidate.trim();
    }
  }
  return null;
}

/** Extract `field -> message` pairs from common validation error payloads. */
function extractFieldErrors(payload: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!payload || typeof payload !== 'object') return result;

  const record = payload as Record<string, unknown>;
  const raw = record['errors'] ?? record['fieldErrors'] ?? record['violations'];
  if (!raw) return result;

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const item = entry as Record<string, unknown>;
      const field = item['field'] ?? item['name'] ?? item['path'];
      const message = item['message'] ?? item['defaultMessage'];
      if (typeof field === 'string' && typeof message === 'string') {
        result[field] = message;
      }
    });
    return result;
  }

  if (typeof raw === 'object') {
    Object.entries(raw as Record<string, unknown>).forEach(([field, value]) => {
      if (typeof value === 'string') result[field] = value;
      else if (Array.isArray(value) && typeof value[0] === 'string') result[field] = value[0];
    });
  }
  return result;
}

/**
 * Convert any thrown value into a predictable `AppError`.
 * Never leaks internals: unknown errors are reported generically.
 */
export function toAppError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'isAppError' in error) {
    return error as unknown as AppError;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;

    if (!error.response) {
      return {
        status: 0,
        message:
          'We could not reach Tutor UG. Please check your internet connection and try again.',
        fieldErrors: {},
        isNetworkError: true,
        isUnauthorized: false,
        isForbidden: false,
        isValidationError: false,
        isNotFound: false,
      };
    }

    const payload = error.response.data;
    const serverMessage = extractServerMessage(payload);
    const fieldErrors = extractFieldErrors(payload);

    return {
      status,
      message: serverMessage ?? defaultErrorMessage(status),
      fieldErrors,
      isNetworkError: false,
      isUnauthorized: status === 401,
      isForbidden: status === 403,
      isValidationError: status === 400 || status === 422,
      isNotFound: status === 404,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message || defaultErrorMessage(0),
      fieldErrors: {},
      isNetworkError: false,
      isUnauthorized: false,
      isForbidden: false,
      isValidationError: false,
      isNotFound: false,
    };
  }

  return {
    status: 0,
    message: defaultErrorMessage(0),
    fieldErrors: {},
    isNetworkError: false,
    isUnauthorized: false,
    isForbidden: false,
    isValidationError: false,
    isNotFound: false,
  };
}

/** Build an `AppError` directly (used by the mock/demo layer). */
export function appError(
  status: number,
  message: string,
  fieldErrors: Record<string, string> = {},
): AppError {
  return {
    status,
    message,
    fieldErrors,
    isNetworkError: status === 0,
    isUnauthorized: status === 401,
    isForbidden: status === 403,
    isValidationError: status === 400 || status === 422,
    isNotFound: status === 404,
  };
}

/** Throw an `AppError` directly (used by the mock/demo layer). */
export function throwAppError(
  status: number,
  message: string,
  fieldErrors: Record<string, string> = {},
): never {
  const err = appError(status, message, fieldErrors);
  Object.defineProperty(err, 'isAppError', { value: true, enumerable: false });
  throw err;
}
