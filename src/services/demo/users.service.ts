import { throwAppError } from '@/utils/apiError';
import type { UpdateProfileRequest } from '@/types/api';
import type { User } from '@/types';
import { findUserById, getDb, saveDb, toSafeUser } from './db';

function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function getMe(): Promise<User> {
  await delay(250);
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

export async function updateMe(payload: UpdateProfileRequest): Promise<User> {
  await delay(450);
  const db = getDb();
  if (!db.currentUserId) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  const user = findUserById(db.currentUserId);
  if (!user) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }

  if (payload.fullName !== undefined) user.fullName = payload.fullName.trim();
  if (payload.phone !== undefined) user.phone = payload.phone.trim() || null;
  if (payload.bio !== undefined) user.bio = payload.bio.trim() || null;

  saveDb();
  return toSafeUser(user);
}
