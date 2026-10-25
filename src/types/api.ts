/**
 * Wire-format (DTO) types.
 *
 * The backend contract is still being agreed with the Spring Boot developer,
 * so these types intentionally declare several plausible aliases for each
 * field. `src/services/api/mappers.ts` normalises them into the strict domain
 * models in `src/types/index.ts`. If the real contract differs, only the
 * mappers need to change.
 */

export type JsonRecord = Record<string, unknown>;

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TUTOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  userId: string | null;
  role: string | null;
  raw: JsonRecord;
}

export interface CreateSessionRequest {
  tutorId: string;
  subject: string;
  scheduledAt: string;
  message?: string;
  durationMinutes?: number;
}

export interface UpdateSessionStatusRequest {
  status: string;
  reason?: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
}

export interface MobileMoneyRequest {
  amount: number;
  phone: string;
  network: 'MTN' | 'AIRTEL';
}

export type TopUpRequest = MobileMoneyRequest;
export type WithdrawRequest = MobileMoneyRequest;
