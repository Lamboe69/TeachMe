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

  if (user.role === 'TUTOR') {
    const tutor = db.tutors.find((entry) => entry.id === user.id);
    if (tutor) {
      if (payload.fullName !== undefined) tutor.fullName = user.fullName;
      if (payload.bio !== undefined) tutor.bio = user.bio;
      if (payload.subjects !== undefined) {
        tutor.subjects = payload.subjects.map((subject) => subject.trim()).filter(Boolean);
      }
      if (payload.hourlyRate !== undefined) {
        tutor.hourlyRate = Math.max(0, Math.round(payload.hourlyRate));
      }
      if (payload.location !== undefined) tutor.location = payload.location.trim() || null;
      if (payload.yearsExperience !== undefined) tutor.yearsExperience = payload.yearsExperience;
      if (payload.availability !== undefined) tutor.availability = payload.availability;
    }
  }

  saveDb();
  return toSafeUser(user);
}
