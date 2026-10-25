import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, feedbackSchema, profileSchema } from '@/utils/schemas';
import { buildBookingSchema } from '@/utils/schemas';
import { getSessionActions, isPast, isUpcoming } from '@/utils/sessionPermissions';
import type { Session, User } from '@/types';

describe('schemas', () => {
  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse({
      fullName: 'Mary Namutebi',
      email: 'mary@example.com',
      password: 'short',
      confirmPassword: 'short',
      role: 'STUDENT',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires password confirmation to match', () => {
    const result = registerSchema.safeParse({
      fullName: 'Mary Namutebi',
      email: 'mary@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'DifferentPass123!',
      role: 'STUDENT',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
  });

  it('requires role selection', () => {
    const result = registerSchema.safeParse({
      fullName: 'Mary Namutebi',
      email: 'mary@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      acceptTerms: true,
    } as never);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes('role'))).toBe(true);
  });

  it('requires terms acceptance', () => {
    const result = registerSchema.safeParse({
      fullName: 'Mary Namutebi',
      email: 'mary@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      role: 'STUDENT',
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('validates email addresses', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'mary@example.com', password: 'x' }).success).toBe(true);
  });

  it('requires a rating between 1 and 5', () => {
    expect(feedbackSchema.safeParse({ rating: 0, comment: 'ok' }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 6, comment: 'ok' }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 4, comment: 'short' }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 5, comment: 'Great session, thank you!' }).success).toBe(true);
  });

  it('allows optional phone and bio in profile schema', () => {
    expect(profileSchema.safeParse({ fullName: 'Mary', phone: '', bio: '' }).success).toBe(true);
    expect(profileSchema.safeParse({ fullName: 'Mary', phone: '+256 700 000 000', bio: 'Student' }).success).toBe(true);
    expect(profileSchema.safeParse({ fullName: 'M' }).success).toBe(false);
  });
});

describe('buildBookingSchema', () => {
  const today = new Date(2026, 5, 1);

  it('rejects dates before today', () => {
    const schema = buildBookingSchema(today);
    const result = schema.safeParse({ subject: 'Math', date: '2026-05-31', time: '09:00' });
    expect(result.success).toBe(false);
  });

  it('accepts today and a future date', () => {
    const schema = buildBookingSchema(today);
    expect(schema.safeParse({ subject: 'Math', date: '2026-06-01', time: '09:00' }).success).toBe(true);
    expect(schema.safeParse({ subject: 'Math', date: '2026-06-01', time: '15:30' }).success).toBe(true);
  });

  it('accepts any hh:mm time string (range is enforced server-side)', () => {
    const schema = buildBookingSchema(today);
    expect(schema.safeParse({ subject: 'Math', date: '2026-06-01', time: '15:30' }).success).toBe(true);
    expect(schema.safeParse({ subject: 'Math', date: '2026-06-01', time: '15' }).success).toBe(false);
  });
});

describe('sessionPermissions', () => {
  const student: User = { id: 's1', fullName: 'Mary', email: 'm@e.com', role: 'STUDENT', phone: null, bio: null, avatarUrl: null, createdAt: null };
  const tutor: User = { id: 't1', fullName: 'Sarah', email: 's@e.com', role: 'TUTOR', phone: null, bio: null, avatarUrl: null, createdAt: null };

  function session(overrides: Partial<Session> = {}): Session {
    return {
      id: 'sess-1',
      student,
      tutor: { id: 't1', fullName: 'Sarah', email: 's@e.com', subjects: ['Math'], bio: null, hourlyRate: 85000, rating: 4.8, reviewCount: 10, sessionCount: 20, yearsExperience: 9, location: 'Kampala', avatarUrl: null },
      subject: 'Mathematics',
      scheduledAt: '2026-06-10T10:00:00',
      durationMinutes: 60,
      status: 'REQUESTED',
      message: null,
      fee: 85000,
      notes: null,
      hasReview: false,
      reviewId: null,
      createdAt: null,
      updatedAt: null,
      ...overrides,
    };
  }

  it('lets a tutor accept and reject their own requested session', () => {
    const actions = getSessionActions(session(), tutor);
    expect(actions.canAccept).toBe(true);
    expect(actions.canReject).toBe(true);
    expect(actions.canComplete).toBe(false);
  });

  it('lets a student cancel their own requested session', () => {
    const actions = getSessionActions(session(), student);
    expect(actions.canCancel).toBe(true);
    expect(actions.canAccept).toBe(false);
  });

  it('lets a student review a completed session they have not yet reviewed', () => {
    const actions = getSessionActions(session({ status: 'COMPLETED', hasReview: false }), student);
    expect(actions.canReview).toBe(true);
  });

  it('does not allow a second review', () => {
    const actions = getSessionActions(session({ status: 'COMPLETED', hasReview: true }), student);
    expect(actions.canReview).toBe(false);
  });

  it('does not allow reviewing a non-completed session', () => {
    const actions = getSessionActions(session({ status: 'ACCEPTED' }), student);
    expect(actions.canReview).toBe(false);
  });

  it('treats past sessions correctly', () => {
    const past = session({ scheduledAt: '2020-01-01T10:00:00', status: 'ACCEPTED' });
    expect(isPast(past)).toBe(true);
    expect(isUpcoming(past)).toBe(false);
  });
});