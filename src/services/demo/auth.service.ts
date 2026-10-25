import { throwAppError } from '@/utils/apiError';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api';
import type { User } from '@/types';
import {
  DEMO_PASSWORD,
  createId,
  findUserByEmail,
  findUserById,
  getDb,
  saveDb,
  toSafeUser,
} from './db';

/** Simulated latency so loading states are visible in demo mode. */
function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function register(payload: RegisterRequest): Promise<LoginResponse> {
  await delay(500);

  const email = payload.email.trim().toLowerCase();
  if (findUserByEmail(email)) {
    throwAppError(409, 'An account with that email already exists. Try logging in instead.', {
      email: 'An account with that email already exists.',
    });
  }

  const db = getDb();
  const user = {
    id: createId('user'),
    fullName: payload.fullName.trim(),
    email,
    role: payload.role,
    phone: null,
    bio: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    password: payload.password,
  };
  db.users.push(user);
  saveDb();

  // The demo backend signs the new account in immediately.
  db.currentUserId = user.id;
  saveDb();

  return {
    token: `demo-token-${user.id}`,
    userId: user.id,
    role: user.role,
    raw: { user: toSafeUser(user) },
  };
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  await delay(450);

  const user = findUserByEmail(payload.email);
  if (!user || user.password !== payload.password) {
    throwAppError(401, 'That email and password combination does not match our records.', {
      password: 'That email and password combination does not match our records.',
    });
  }

  const db = getDb();
  db.currentUserId = user.id;
  saveDb();

  return {
    token: `demo-token-${user.id}`,
    userId: user.id,
    role: user.role,
    raw: { user: toSafeUser(user) },
  };
}

export async function me(): Promise<User> {
  await delay(200);
  const db = getDb();
  if (!db.currentUserId) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  const user = findUserById(db.currentUserId);
  if (!user) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  return toSafeUser(user);
}

export async function logout(): Promise<void> {
  await delay(150);
  const db = getDb();
  db.currentUserId = null;
  saveDb();
}

export const DEMO_CREDENTIALS = {
  student: { email: 'mary.demo@tutorug.ug', password: DEMO_PASSWORD },
  tutor: { email: 'sarah.demo@tutorug.ug', password: DEMO_PASSWORD },
};

/**
 * Password reset is not implemented in demo mode either — we say so rather
 * than pretending a reset email was sent.
 */
export async function requestPasswordReset(): Promise<void> {
  throwAppError(
    501,
    'Password reset is not available yet. Please contact support to recover your account.',
  );
}
