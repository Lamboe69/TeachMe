import { throwAppError } from '@/utils/apiError';
import type { SessionMessage } from '@/types';
import { createId, findUserById, getDb, saveDb } from './db';

function delay(ms = 250): Promise<void> {
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

function findSessionForParticipant(sessionId: string) {
  const userId = currentUserId();
  const db = getDb();
  const session = db.sessions.find((entry) => entry.id === sessionId);
  if (!session) {
    throwAppError(404, 'We could not find that session.');
  }
  const isParticipant = session.student.id === userId || session.tutor.id === userId;
  if (!isParticipant) {
    throwAppError(403, 'You do not have permission to view this chat.');
  }
  return { db, session, userId };
}

export async function listMessages(sessionId: string): Promise<SessionMessage[]> {
  await delay();
  const { db } = findSessionForParticipant(sessionId);
  return db.messages
    .filter((message) => message.sessionId === sessionId)
    .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
}

export async function sendMessage(sessionId: string, body: string): Promise<SessionMessage> {
  await delay(300);
  const { db, userId } = findSessionForParticipant(sessionId);
  const text = body.trim();
  if (!text) {
    throwAppError(400, 'Write a message before sending.', { body: 'Write a message.' });
  }
  if (text.length > 1000) {
    throwAppError(400, 'Keep messages under 1,000 characters.', { body: 'Message is too long.' });
  }

  const sender = findUserById(userId);
  const message: SessionMessage = {
    id: createId('message'),
    sessionId,
    senderId: userId,
    senderName: sender?.fullName ?? 'TutorUG user',
    body: text,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(message);
  saveDb();
  return message;
}
