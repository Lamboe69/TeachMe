/**
 * Every backend path used by the frontend lives here.
 *
 * The endpoint list below is the *proposed* contract agreed for the MVP. If
 * the Spring Boot backend exposes different paths, change them in this file
 * only — no component or service body needs to be touched.
 */
export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    /**
     * Optional: only used when `VITE_PASSWORD_RESET_ENABLED=true`.
     * This endpoint is NOT part of the agreed MVP contract yet — it is
     * listed here so it can be enabled without touching any component.
     */
    forgotPassword: '/api/auth/forgot-password',
  },
  tutors: {
    list: '/api/tutors',
    byId: (id: string) => `/api/tutors/${id}`,
    reviews: (id: string) => `/api/tutors/${id}/reviews`,
    subjects: '/api/tutors/subjects',
  },
  sessions: {
    /** Sessions belonging to the authenticated user (student or tutor). */
    mine: '/api/sessions/my',
    create: '/api/sessions',
    byId: (id: string) => `/api/sessions/${id}`,
    status: (id: string) => `/api/sessions/${id}/status`,
    reviews: (id: string) => `/api/sessions/${id}/reviews`,
  },
  users: {
    me: '/api/users/me',
    updateMe: '/api/users/me',
  },
  wallet: {
    /** The authenticated user's wallet balances. */
    me: '/api/wallet',
    /** Start a mobile money top-up (MTN MoMo / Airtel Money). */
    topUp: '/api/wallet/top-up',
    /** Send available funds back to the user's mobile money account. */
    withdraw: '/api/wallet/withdraw',
    transactions: '/api/wallet/transactions',
  },
} as const;

/**
 * Backend states. Kept in one place so the UI tabs and badges always agree
 * with what the server calls them.
 */
export const SESSION_STATUS_VALUES = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;
