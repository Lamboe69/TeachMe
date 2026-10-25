/**
 * Domain models used across the Tutor UG frontend.
 *
 * These are the shapes the UI consumes. They are produced by the mapping
 * layer in `src/services/api/mappers.ts` so that backend DTO differences
 * (camelCase vs snake_case, nested vs flat) never leak into components.
 */

export type UserRole = 'STUDENT' | 'TUTOR';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

export interface TutorSummary {
  id: string;
  fullName: string;
  email: string | null;
  subjects: string[];
  bio: string | null;
  /** Hourly rate in Ugandan shillings (UGX). */
  hourlyRate: number;
  rating: number | null;
  reviewCount: number;
  sessionCount: number;
  yearsExperience: number | null;
  location: string | null;
  avatarUrl: string | null;
}

export interface Tutor extends TutorSummary {
  reviews: Review[];
}

export type SessionStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'UNKNOWN';

export interface Session {
  id: string;
  student: User;
  tutor: TutorSummary;
  subject: string;
  /** ISO-8601 timestamp of the scheduled session. */
  scheduledAt: string;
  durationMinutes: number | null;
  status: SessionStatus;
  /** Free-text note the student sent with the booking request. */
  message: string | null;
  /** Agreed fee for the session, in UGX. */
  fee: number | null;
  /** Tutor-only notes attached to the session. */
  notes: string | null;
  hasReview: boolean;
  reviewId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Review {
  id: string;
  sessionId: string | null;
  tutorId: string;
  studentId: string | null;
  studentName: string | null;
  /** 1 - 5 stars. */
  rating: number;
  comment: string;
  createdAt: string | null;
}

/** Query parameters accepted by the tutor directory endpoint. */
export interface TutorQuery {
  search?: string;
  subject?: string;
  minRating?: number;
  maxRate?: number;
  page?: number;
  size?: number;
}

/** Paged envelope returned by the backend (when supported). */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type MobileMoneyNetwork = 'MTN' | 'AIRTEL';

export type WalletTransactionType =
  | 'TOP_UP'
  | 'WITHDRAWAL'
  | 'SESSION_PAYMENT'
  | 'SESSION_EARNING'
  | 'REFUND';

export interface Wallet {
  userId: string;
  /** Money the user can spend or withdraw right now, in UGX. */
  availableBalance: number;
  /** Money held by TutorUG for sessions that are not finished yet, in UGX. */
  escrowBalance: number;
  currency: 'UGX';
  updatedAt: string | null;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  /** Positive for money in, negative for money out. */
  amount: number;
  balanceAfter: number;
  sessionId: string | null;
  description: string;
  reference: string | null;
  createdAt: string | null;
}
