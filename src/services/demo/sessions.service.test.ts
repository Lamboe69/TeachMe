import { beforeEach, describe, expect, it } from 'vitest';
import { WEEK_DAYS } from '@/utils/availability';
import { getDb, resetDb, saveDb } from './db';
import * as sessions from './sessions.service';
import * as tutors from './tutors.service';
import * as users from './users.service';

function openEveryDay() {
  const db = getDb();
  for (const tutor of db.tutors) {
    tutor.availability = WEEK_DAYS.map((day) => ({
      day,
      enabled: true,
      start: '08:00',
      end: '21:00',
    }));
  }
  saveDb();
}

function signInAs(userId: string) {
  const db = getDb();
  db.currentUserId = userId;
  saveDb();
}

function nextWeekday(dayName: string, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (date.toLocaleDateString('en-US', { weekday: 'long' }) !== dayName) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(hour, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(hour).padStart(2, '0');
  return `${year}-${month}-${day}T${time}:00:00`;
}

function moveSessionIntoPast(sessionId: string) {
  const db = getDb();
  const session = db.sessions.find((entry) => entry.id === sessionId);
  if (session) {
    session.scheduledAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    saveDb();
  }
}

function tomorrowAt(hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(hour).padStart(2, '0');
  return `${year}-${month}-${day}T${time}:00:00`;
}

beforeEach(() => {
  resetDb();
  openEveryDay();
});

describe('demo session booking', () => {
  it('lets a tutor book another tutor as a learner', async () => {
    signInAs('tutor-001');
    const session = await sessions.create({
      tutorId: 'tutor-002',
      subject: 'Calculus',
      scheduledAt: tomorrowAt(10),
      message: 'I would like help with integration.',
    });

    expect(session.student.id).toBe('tutor-001');
    expect(session.tutor.id).toBe('tutor-002');
    expect(session.status).toBe('REQUESTED');
  });

  it('stops a tutor from booking their own profile', async () => {
    signInAs('tutor-001');
    await expect(
      sessions.create({
        tutorId: 'tutor-001',
        subject: 'Calculus',
        scheduledAt: tomorrowAt(10),
      }),
    ).rejects.toThrow(/yourself/i);
  });
});

describe('tutor availability', () => {
  it('persists the saved weekly schedule on the tutor profile', async () => {
    signInAs('tutor-001');
    await users.updateMe({
      availability: [
        { day: 'Monday', enabled: true, start: '09:00', end: '11:00', slots: ['09:00', '10:00'] },
        { day: 'Tuesday', enabled: false, start: '09:00', end: '17:00' },
      ],
    });

    const tutor = await tutors.get('tutor-001');
    expect(tutor.availability).toHaveLength(2);
    expect(tutor.availability?.[0]?.slots).toEqual(['09:00', '10:00']);
  });

  it('refuses bookings when the tutor has not published availability', async () => {
    const db = getDb();
    const tutor = db.tutors.find((entry) => entry.id === 'tutor-002');
    if (tutor) tutor.availability = [];
    saveDb();

    signInAs('student-mary');
    await expect(
      sessions.create({
        tutorId: 'tutor-002',
        subject: 'ICT',
        scheduledAt: tomorrowAt(10),
      }),
    ).rejects.toThrow(/not published any available times/i);
  });

  it('rejects bookings outside the tutor availability', async () => {
    signInAs('tutor-001');
    await users.updateMe({
      availability: [
        { day: 'Monday', enabled: true, start: '09:00', end: '10:00', slots: ['09:00'] },
      ],
    });

    signInAs('student-mary');
    await expect(
      sessions.create({
        tutorId: 'tutor-001',
        subject: 'Calculus',
        scheduledAt: nextWeekday('Monday', 10),
      }),
    ).rejects.toThrow(/availability/i);

    const confirmed = await sessions.create({
      tutorId: 'tutor-001',
      subject: 'Calculus',
      scheduledAt: nextWeekday('Monday', 9),
    });
    expect(confirmed.status).toBe('REQUESTED');
  });
});

describe('session chat', () => {
  it('lets both paid participants message each other', async () => {
    signInAs('student-mary');
    const session = await sessions.create({
      tutorId: 'tutor-001',
      subject: 'Mathematics',
      scheduledAt: tomorrowAt(13),
    });

    const sent = await sessions.sendMessage(session.id, 'Hello, where should we meet?');
    expect(sent.senderId).toBe('student-mary');

    signInAs('tutor-001');
    await sessions.sendMessage(session.id, 'Let us meet at the main library.');
    const messages = await sessions.listMessages(session.id);
    expect(messages).toHaveLength(2);
  });

  it('blocks people who are not part of the session', async () => {
    signInAs('student-mary');
    const session = await sessions.create({
      tutorId: 'tutor-001',
      subject: 'Mathematics',
      scheduledAt: tomorrowAt(16),
    });

    signInAs('student-isaac-k');
    await expect(sessions.listMessages(session.id)).rejects.toThrow(/permission/i);
  });

  it('needs both parties to confirm before the session is completed', async () => {
    signInAs('student-mary');
    const session = await sessions.create({
      tutorId: 'tutor-001',
      subject: 'Mathematics',
      scheduledAt: tomorrowAt(11),
    });

    signInAs('tutor-001');
    await sessions.updateStatus(session.id, 'ACCEPTED');
    moveSessionIntoPast(session.id);
    const tutorConfirmed = await sessions.updateStatus(session.id, 'COMPLETED');
    expect(tutorConfirmed.status).toBe('ACCEPTED');

    signInAs('student-mary');
    const bothConfirmed = await sessions.updateStatus(session.id, 'COMPLETED');
    expect(bothConfirmed.status).toBe('COMPLETED');
  });
});
