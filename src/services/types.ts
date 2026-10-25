import type {
  CreateReviewRequest,
  CreateSessionRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TopUpRequest,
  UpdateProfileRequest,
  WithdrawRequest,
} from '@/types/api';
import type {
  Page,
  Review,
  Session,
  Tutor,
  TutorQuery,
  TutorSummary,
  User,
  Wallet,
  WalletTransaction,
} from '@/types';

/**
 * The contract every service implementation must satisfy.
 * The live (Axios) services and the demo (mock) services both satisfy it, so
 * components never need to know which one is active.
 */
export interface AuthService {
  register(payload: RegisterRequest): Promise<LoginResponse>;
  login(payload: LoginRequest): Promise<LoginResponse>;
  me(): Promise<User>;
  logout(): Promise<void>;
  /** Optional — only implemented once the backend supports password resets. */
  requestPasswordReset(email: string): Promise<void>;
}

export interface TutorsService {
  list(query?: TutorQuery): Promise<Page<TutorSummary>>;
  get(id: string): Promise<Tutor>;
  getReviews(tutorId: string): Promise<Review[]>;
  getSubjects(): Promise<string[]>;
}

export interface SessionsService {
  listMine(): Promise<Session[]>;
  get(id: string): Promise<Session>;
  create(payload: CreateSessionRequest): Promise<Session>;
  updateStatus(id: string, status: string, reason?: string): Promise<Session>;
}

export interface ReviewsService {
  create(sessionId: string, payload: CreateReviewRequest): Promise<Review>;
}

export interface UsersService {
  getMe(): Promise<User>;
  updateMe(payload: UpdateProfileRequest): Promise<User>;
}

export interface WalletService {
  getWallet(): Promise<Wallet>;
  listTransactions(): Promise<WalletTransaction[]>;
  /** Load the wallet with money from MTN MoMo or Airtel Money. */
  topUp(payload: TopUpRequest): Promise<Wallet>;
  /** Send available funds back to the user's mobile money account. */
  withdraw(payload: WithdrawRequest): Promise<Wallet>;
}

export interface Services {
  auth: AuthService;
  tutors: TutorsService;
  sessions: SessionsService;
  reviews: ReviewsService;
  users: UsersService;
  wallet: WalletService;
}
