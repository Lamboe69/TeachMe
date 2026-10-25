import { throwAppError } from '@/utils/apiError';
import type { CreateSessionRequest, UpdateSessionStatusRequest } from '@/types/api';
import type { Session, SessionStatus } from '@/types';
import { findTutorById, findUserById, getDb, makeSession, saveDb, toSafeUser } from './db';
import { holdSessionFunds, refundSessionFunds, releaseSessionEarnings } from './wallet.service';

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function currentUserId(): string {
  const db = getDb();
  if (!db.currentUserId) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  return db.currentUserId;
}

function participantIds(session: Session): string[] {
  return [session.student?.id, session.tutor?.id].filter(Boolean);
}

export async function listMine(): Promise<Session[]> {
  await delay(400);
  const userId = currentUserId();
  const db = getDb();
  return db.sessions
    .filter((session) => participantIds(session).includes(userId))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export async function get(id: string): Promise<Session> {
  await delay(300);
  const userId = currentUserId();
  const db = getDb();
  const session = db.sessions.find((entry) => entry.id === id);
  if (!session) {
    throwAppError(404, 'We could not find that session.');
  }
  if (!participantIds(session).includes(userId)) {
    throwAppError(403, 'You do not have permission to view this session.');
  }
  return session;
}

export async function create(payload: CreateSessionRequest): Promise<Session> {
  await delay(600);

  const userId = currentUserId();
  const db = getDb();
  const student = findUserById(userId);
  if (!student) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  if (student.role !== 'STUDENT') {
    throwAppError(403, 'Only student accounts can request tutoring sessions.');
  }

  const tutor = findTutorById(payload.tutorId);
  if (!tutor) {
    throwAppError(404, 'We could not find that tutor.');
  }

  const scheduled = new Date(payload.scheduledAt);
  if (Number.isNaN(scheduled.getTime())) {
    throwAppError(400, 'Please choose a valid date and time.', {
      scheduledAt: 'Please choose a valid date and time.',
    });
  }
  if (scheduled.getTime() <= Date.now()) {
    throwAppError(400, 'Please choose a date and time in the future.', {
      scheduledAt: 'Please choose a date and time in the future.',
    });
  }

  const duplicate = db.sessions.some(
    (session) =>
      session.tutor.id === tutor.id &&
      session.student.id === student.id &&
      session.status === 'REQUESTED' &&
      session.scheduledAt.slice(0, 16) === payload.scheduledAt.slice(0, 16),
  );
  if (duplicate) {
    throwAppError(409, 'You already have a pending request for that tutor at that time.');
  }

  const session = makeSession(
    toSafeUser(student),
    tutor,
    payload.subject.trim(),
    payload.scheduledAt,
    payload.message?.trim() ? payload.message.trim() : null,
    tutor.hourlyRate,
  );

  // Student pays from their wallet up front; TutorUG holds the money in escrow.
  holdSessionFunds(session);

  db.sessions.unshift(session);
  saveDb();
  return session;
}

const ALLOWED_TRANSITIONS: Record<string, SessionStatus[]> = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export async function updateStatus(
  id: string,
  status: UpdateSessionStatusRequest['status'],
  reason?: string,
): Promise<Session> {
  await delay(500);

  const userId = currentUserId();
  const db = getDb();
  const session = db.sessions.find((entry) => entry.id === id);
  if (!session) {
    throwAppError(404, 'We could not find that session.');
  }

  const isTutor = session.tutor.id === userId;
  const isStudent = session.student.id === userId;
  if (!isTutor && !isStudent) {
    throwAppError(403, 'You do not have permission to update this session.');
  }

  const next = (status ?? '').toUpperCase() as SessionStatus;
  if (!['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(next)) {
    throwAppError(400, 'That session status is not supported.');
  }

  if (next === 'ACCEPTED' || next === 'REJECTED') {
    if (!isTutor) {
      throwAppError(403, 'Only the tutor can accept or decline a booking request.');
    }
    if (session.status !== 'REQUESTED') {
      throwAppError(409, 'This request has already been handled.');
    }
  }

  if (next === 'COMPLETED' && !isTutor) {
    throwAppError(403, 'Only the tutor can mark a session as completed.');
  }

  if (next === 'CANCELLED' && session.status === 'COMPLETED') {
    throwAppError(409, 'A completed session cannot be cancelled.');
  }

  const allowed = ALLOWED_TRANSITIONS[session.status] ?? [];
  if (!allowed.includes(next)) {
    throwAppError(
      409,
      `This session cannot move from ${session.status.toLowerCase()} to ${next.toLowerCase()}.`,
    );
  }

  session.status = next;
  session.updatedAt = new Date().toISOString();
  if (next === 'CANCELLED' && reason?.trim()) {
    session.notes = reason.trim();
  }

  if (next === 'COMPLETED') {
    // Release the escrowed fee to the tutor, minus the platform fee.
    releaseSessionEarnings(session);
  } else if (next === 'CANCELLED' || next === 'REJECTED') {
    // Give the student their money back.
    refundSessionFunds(session);
  }

  saveDb();
  return session;
}

export async function addNote(id: string, note: string): Promise<Session> {
  await delay(300);
  const userId = currentUserId();
  const db = getDb();
  const session = db.sessions.find((entry) => entry.id === id);
  if (!session) throwAppError(404, 'We could not find that session.');
  if (session.tutor.id !== userId) {
    throwAppError(403, 'Only the tutor can add notes to a session.');
  }
  session.notes = note.trim();
  session.updatedAt = new Date().toISOString();
  saveDb();
  return session;
}
