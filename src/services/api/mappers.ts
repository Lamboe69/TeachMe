import type { JsonRecord } from '@/types/api';
import type {
  Page,
  Review,
  Session,
  SessionMessage,
  SessionStatus,
  Tutor,
  TutorSummary,
  User,
  UserRole,
} from '@/types';

/**
 * DTO -> domain mapping.
 *
 * The backend contract is still being finalised, so the mappers accept the
 * plausible aliases for each field (camelCase / snake_case, nested / flat).
 * When the contract is locked in, tighten these functions — nothing else in
 * the app needs to change.
 */

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [];
}

function pick(record: JsonRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() ? value.trim() : null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  const raw = asArray(value);
  const out: string[] = [];
  raw.forEach((entry) => {
    if (typeof entry === 'string') {
      entry
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => out.push(part));
    } else if (entry && typeof entry === 'object') {
      const name = asString(pick(asRecord(entry), 'name', 'subject', 'title', 'subjectName'));
      if (name) out.push(name);
    }
  });
  return Array.from(new Set(out));
}

const ROLE_ALIASES: Record<string, UserRole> = {
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR',
  LEARNER: 'STUDENT',
  TEACHER: 'TUTOR',
};

export function mapRole(value: unknown): UserRole {
  const raw = asString(value)?.toUpperCase() ?? '';
  return ROLE_ALIASES[raw] ?? 'STUDENT';
}

export function mapUser(dto: unknown): User {
  const d = asRecord(dto);
  const id = asString(pick(d, 'id', 'userId', 'user_id', 'uuid'));
  return {
    id: id ?? '',
    fullName: asString(pick(d, 'fullName', 'full_name', 'name', 'displayName')) ?? 'Unknown user',
    email: asString(pick(d, 'email', 'emailAddress', 'email_address')) ?? '',
    role: mapRole(pick(d, 'role', 'userRole', 'user_role', 'accountType')),
    phone: asString(pick(d, 'phone', 'phoneNumber', 'phone_number', 'contact')),
    bio: asString(pick(d, 'bio', 'biography', 'about')),
    avatarUrl: asString(pick(d, 'avatarUrl', 'avatar_url', 'photoUrl', 'profileImage', 'imageUrl')),
    createdAt: asString(pick(d, 'createdAt', 'created_at', 'registeredAt')),
  };
}

export function mapTutorSummary(dto: unknown): TutorSummary {
  const d = asRecord(dto);
  const id = asString(pick(d, 'id', 'tutorId', 'tutor_id', 'userId', 'user_id'));
  const rating = asNumber(pick(d, 'rating', 'averageRating', 'average_rating', 'avgRating'));
  const reviewCount =
    asNumber(pick(d, 'reviewCount', 'review_count', 'numberOfReviews', 'reviewsCount')) ?? 0;
  return {
    id: id ?? '',
    fullName:
      asString(pick(d, 'fullName', 'full_name', 'name', 'displayName', 'tutorName')) ?? 'Tutor',
    email: asString(pick(d, 'email', 'emailAddress')),
    subjects: asStringArray(pick(d, 'subjects', 'subject', 'specialisations', 'specializations')),
    bio: asString(pick(d, 'bio', 'biography', 'about', 'description')),
    hourlyRate: asNumber(pick(d, 'hourlyRate', 'hourly_rate', 'rate', 'pricePerHour', 'ratePerHour')) ?? 0,
    rating,
    reviewCount,
    sessionCount:
      asNumber(pick(d, 'sessionCount', 'session_count', 'sessionsCompleted', 'completedSessions')) ?? 0,
    yearsExperience: asNumber(pick(d, 'yearsExperience', 'years_experience', 'experienceYears')),
    location: asString(pick(d, 'location', 'district', 'city', 'address', 'basedIn')),
    avatarUrl: asString(pick(d, 'avatarUrl', 'avatar_url', 'photoUrl', 'profileImage', 'imageUrl')),
  };
}

export function mapReview(dto: unknown): Review {
  const d = asRecord(dto);
  const studentDto = pick(d, 'student', 'reviewer');
  const studentRecord = asRecord(studentDto);
  return {
    id: asString(pick(d, 'id', 'reviewId', 'review_id')) ?? '',
    sessionId: asString(pick(d, 'sessionId', 'session_id', 'bookingId')),
    tutorId: asString(pick(d, 'tutorId', 'tutor_id')) ?? '',
    studentId:
      asString(pick(d, 'studentId', 'student_id')) ?? asString(pick(studentRecord, 'id', 'userId')),
    studentName:
      asString(pick(d, 'studentName', 'student_name')) ??
      asString(pick(studentRecord, 'fullName', 'full_name', 'name')),
    rating: asNumber(pick(d, 'rating', 'stars', 'score')) ?? 0,
    comment: asString(pick(d, 'comment', 'review', 'text', 'feedback', 'message')) ?? '',
    createdAt: asString(pick(d, 'createdAt', 'created_at', 'date', 'submittedAt')),
  };
}

export function mapTutor(dto: unknown, reviews: Review[] = []): Tutor {
  const summary = mapTutorSummary(dto);
  const d = asRecord(dto);
  const embeddedReviews = asArray(pick(d, 'reviews')).map(mapReview);
  const reviewCount = summary.reviewCount > 0 ? summary.reviewCount : embeddedReviews.length;
  return {
    ...summary,
    reviewCount,
    reviews: embeddedReviews.length > 0 ? embeddedReviews : reviews,
  };
}

const STATUS_ALIASES: Record<string, SessionStatus> = {
  REQUESTED: 'REQUESTED',
  PENDING: 'REQUESTED',
  AWAITING_RESPONSE: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  CONFIRMED: 'ACCEPTED',
  APPROVED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  DONE: 'COMPLETED',
  FINISHED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CANCELED: 'CANCELLED',
  REJECTED: 'REJECTED',
  DECLINED: 'REJECTED',
  REFUSED: 'REJECTED',
};

export function mapStatus(value: unknown): SessionStatus {
  const raw = asString(value)?.toUpperCase().replace(/[\s-]+/g, '_') ?? '';
  return STATUS_ALIASES[raw] ?? 'UNKNOWN';
}

export function mapSession(dto: unknown): Session {
  const d = asRecord(dto);
  const tutorDto = pick(d, 'tutor', 'tutorProfile', 'tutorUser');
  const studentDto = pick(d, 'student', 'studentProfile', 'studentUser');

  const tutor = tutorDto
    ? mapTutorSummary(tutorDto)
    : mapTutorSummary({
        id: pick(d, 'tutorId', 'tutor_id'),
        fullName: pick(d, 'tutorName', 'tutor_name'),
      });

  const student = studentDto
    ? mapUser(studentDto)
    : mapUser({
        id: pick(d, 'studentId', 'student_id'),
        fullName: pick(d, 'studentName', 'student_name'),
        email: pick(d, 'studentEmail', 'student_email'),
      });

  const reviewDto = pick(d, 'review', 'latestReview');
  const hasReviewFlag = asBoolean(pick(d, 'hasReview', 'has_review', 'reviewed'));
  const reviewId = asString(pick(d, 'reviewId', 'review_id'));

  return {
    id: asString(pick(d, 'id', 'sessionId', 'session_id', 'bookingId')) ?? '',
    student,
    tutor,
    subject: asString(pick(d, 'subject', 'subjectName', 'subject_name', 'topic')) ?? 'General',
    scheduledAt:
      asString(pick(d, 'scheduledAt', 'scheduled_at', 'sessionDate', 'sessionTime', 'startsAt')) ??
      '',
    durationMinutes: asNumber(pick(d, 'durationMinutes', 'duration_minutes', 'duration')),
    status: mapStatus(pick(d, 'status', 'state', 'sessionStatus')),
    message: asString(pick(d, 'message', 'note', 'studentMessage', 'requestMessage', 'notes')),
    fee: asNumber(pick(d, 'fee', 'price', 'amount', 'totalPrice', 'cost')),
    notes: asString(pick(d, 'notes', 'tutorNotes', 'tutor_notes')),
    studentConfirmedAt: asString(pick(d, 'studentConfirmedAt', 'student_confirmed_at')),
    tutorConfirmedAt: asString(pick(d, 'tutorConfirmedAt', 'tutor_confirmed_at')),
    hasReview: hasReviewFlag ?? (Boolean(reviewDto) || Boolean(reviewId)),
    reviewId: reviewId ?? asString(asRecord(reviewDto)['id']),
    createdAt: asString(pick(d, 'createdAt', 'created_at')),
    updatedAt: asString(pick(d, 'updatedAt', 'updated_at')),
  };
}

export function mapSessionMessage(dto: unknown): SessionMessage {
  const d = asRecord(dto);
  return {
    id: asString(pick(d, 'id', 'messageId', 'message_id')) ?? '',
    sessionId: asString(pick(d, 'sessionId', 'session_id')) ?? '',
    senderId: asString(pick(d, 'senderId', 'sender_id', 'userId', 'user_id')) ?? '',
    senderName:
      asString(pick(d, 'senderName', 'sender_name', 'fullName', 'full_name')) ?? 'TutorUG user',
    body: asString(pick(d, 'body', 'message', 'text', 'content')) ?? '',
    createdAt: asString(pick(d, 'createdAt', 'created_at', 'sentAt', 'sent_at')),
  };
}

/**
 * Normalise a list endpoint that may return a bare array, a Spring
 * `Page` envelope, or `{ items: [...] }` / `{ data: [...] }`.
 */
export function mapPage<T>(dto: unknown, mapper: (item: unknown) => T): Page<T> {
  if (Array.isArray(dto)) {
    return {
      content: dto.map(mapper),
      totalElements: dto.length,
      totalPages: 1,
      number: 0,
      size: dto.length,
    };
  }

  const d = asRecord(dto);
  const rawContent = pick(d, 'content', 'items', 'data', 'results', 'tutors', 'sessions');
  const content = asArray(rawContent).map(mapper);

  return {
    content,
    totalElements: asNumber(pick(d, 'totalElements', 'total_elements', 'total')) ?? content.length,
    totalPages: asNumber(pick(d, 'totalPages', 'total_pages')) ?? (content.length ? 1 : 0),
    number: asNumber(pick(d, 'number', 'page', 'pageNumber')) ?? 0,
    size: asNumber(pick(d, 'size', 'pageSize')) ?? content.length,
  };
}

export function mapList<T>(dto: unknown, mapper: (item: unknown) => T): T[] {
  if (Array.isArray(dto)) return dto.map(mapper);
  const d = asRecord(dto);
  const raw = pick(d, 'content', 'items', 'data', 'results', 'reviews', 'sessions', 'tutors');
  return asArray(raw).map(mapper);
}
