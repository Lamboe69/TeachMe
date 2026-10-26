import { WEEK_DAYS } from '@/utils/availability';
import type {
  AvailabilitySlot,
  Review,
  Session,
  SessionMessage,
  SessionStatus,
  TutorSummary,
  User,
  UserRole,
  Wallet,
  WalletTransaction,
} from '@/types';

/**
 * DEMO DATA — sample content only.
 *
 * Nothing in this file is connected to the Spring Boot backend. It backs the
 * explicit, opt-in demo mode (`VITE_DEMO_MODE=true`) so the UI can be
 * reviewed before the API is ready. The data is stored in `sessionStorage`,
 * is clearly labelled in the interface, and is discarded when the tab closes.
 */

export interface DemoUser extends User {
  /** Plaintext password — mock data only, never sent anywhere. */
  password: string;
}

/** A session payment held by the platform until the session is settled. */
export interface DemoEscrow {
  sessionId: string;
  studentId: string;
  tutorId: string;
  /** Total amount the student paid into escrow, in UGX. */
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
}

export interface DemoDb {
  users: DemoUser[];
  tutors: TutorSummary[];
  reviews: Review[];
  sessions: Session[];
  messages: SessionMessage[];
  wallets: Record<string, Wallet>;
  transactions: WalletTransaction[];
  escrows: Record<string, DemoEscrow>;
  currentUserId: string | null;
}

export const DEMO_STUDENT_EMAIL = 'mary.demo@tutorug.ug';
export const DEMO_TUTOR_EMAIL = 'sarah.demo@tutorug.ug';
export const DEMO_PASSWORD = 'Demo1234';

const STORAGE_KEY = 'tutorug.demo.db.v3';

function at(daysFromNow: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  // Local (no timezone suffix) so the UI renders the wall-clock time as seeded.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    hour,
  )}:${pad(minute)}:00`;
}

const TUTORS: TutorSummary[] = [
  {
    id: 'tutor-001',
    fullName: 'Sarah Namutebi',
    email: DEMO_TUTOR_EMAIL,
    subjects: ['Mathematics', 'Further Mathematics', 'Physics'],
    bio: 'Senior 6 candidate who just nailed my UACE maths paper. I work through algebra, calculus and mechanics step by step, and I am happy to go over past papers until it clicks. I know how confusing quadratics can feel.',
    hourlyRate: 85000,
    rating: 4.8,
    reviewCount: 126,
    sessionCount: 214,
    yearsExperience: null,
    location: 'Kampala, Wakiso',
    avatarUrl: null,
  },
  {
    id: 'tutor-002',
    fullName: 'Brian Odong',
    email: 'brian.demo@tutorug.ug',
    subjects: ['Mathematics', 'ICT', 'Computer Studies'],
    bio: 'Studying Computer Science at Makerere and coaching O-Level ICT on the side. I cover spreadsheets, databases and networking with lots of guided practice — you will actually do the work, not just watch me.',
    hourlyRate: 45000,
    rating: 4.6,
    reviewCount: 89,
    sessionCount: 173,
    yearsExperience: null,
    location: 'Kampala',
    avatarUrl: null,
  },
  {
    id: 'tutor-003',
    fullName: 'Grace Nakimera',
    email: 'grace.demo@tutorug.ug',
    subjects: ['English Literature', 'Kiswahili', 'Creative Writing'],
    bio: 'A-Level English top performer and published young poet. I help with essay structure, poetry analysis and exam technique, and I am patient with learners who find reading difficult. We build the essay together, start to finish.',
    hourlyRate: 50000,
    rating: 4.9,
    reviewCount: 204,
    sessionCount: 388,
    yearsExperience: null,
    location: 'Wakiso',
    avatarUrl: null,
  },
  {
    id: 'tutor-004',
    fullName: 'Isaac Mugisha',
    email: 'isaac.demo@tutorug.ug',
    subjects: ['Physics', 'Chemistry'],
    bio: 'P7 science star who loves making mechanics and electricity intuitive. I bring worked examples and past-paper walkthroughs to every session, so you learn by doing rather than by memorising.',
    hourlyRate: 75000,
    rating: 4.5,
    reviewCount: 63,
    sessionCount: 142,
    yearsExperience: null,
    location: 'Kampala',
    avatarUrl: null,
  },
  {
    id: 'tutor-005',
    fullName: 'Juliet Achieng',
    email: 'juliet.demo@tutorug.ug',
    subjects: ['Biology', 'Chemistry', 'Agriculture'],
    bio: 'Studying veterinary science and coaching biology and chemistry to UACE and nursing-entry candidates. I emphasise diagrams and recall, which is what those exams actually reward.',
    hourlyRate: 55000,
    rating: 4.7,
    reviewCount: 97,
    sessionCount: 165,
    yearsExperience: null,
    location: 'Jinja',
    avatarUrl: null,
  },
  {
    id: 'tutor-006',
    fullName: 'Peter Wasswa',
    email: 'peter.demo@tutorug.ug',
    subjects: ['Mathematics', 'Further Mathematics'],
    bio: 'UACE maths and further-maths graduate who has coached more than 200 learners. I specialise in learners who have fallen behind and need a fresh, patient start — no judgment, just clear explanations.',
    hourlyRate: 60000,
    rating: 4.4,
    reviewCount: 41,
    sessionCount: 88,
    yearsExperience: null,
    location: 'Fort Portal',
    avatarUrl: null,
  },
  {
    id: 'tutor-007',
    fullName: 'Christine Atuhaire',
    email: 'christine.demo@tutorug.ug',
    subjects: ['Chemistry', 'Biology'],
    bio: 'Senior 6 science candidate with a knack for simple models and worked calculations. I help learners stop memorising equations and start reasoning through them instead.',
    hourlyRate: 40000,
    rating: 4.3,
    reviewCount: 52,
    sessionCount: 96,
    yearsExperience: null,
    location: 'Mbarara',
    avatarUrl: null,
  },
  {
    id: 'tutor-008',
    fullName: 'Daniel Kizito',
    email: 'daniel.demo@tutorug.ug',
    subjects: ['ICT', 'Computer Studies', 'Programming'],
    bio: 'Computer science student who teaches programming, web design and the ICT syllabus. Sessions are hands-on: you will write code, not just watch slides. I have been there — it is a lot less scary with someone beside you.',
    hourlyRate: 65000,
    rating: 4.7,
    reviewCount: 78,
    sessionCount: 121,
    yearsExperience: null,
    location: 'Kampala',
    avatarUrl: null,
  },
];

const USERS: DemoUser[] = [
  {
    id: 'student-mary',
    fullName: 'Mary Namutebi',
    email: DEMO_STUDENT_EMAIL,
    role: 'STUDENT',
    phone: '+256 772 445 019',
    bio: 'Senior 4 student preparing for UACE. Interested in Mathematics, Biology and Physics.',
    avatarUrl: null,
    createdAt: at(-42, 8),
    password: DEMO_PASSWORD,
  },
  {
    id: 'tutor-001',
    fullName: 'Sarah Namutebi',
    email: DEMO_TUTOR_EMAIL,
    role: 'TUTOR',
    phone: '+256 701 220 874',
    bio: 'Senior 6 candidate. I aced my UACE maths paper and now help others do the same — algebra, calculus and mechanics, explained the way I wish someone had explained them to me.',
    avatarUrl: null,
    createdAt: at(-200, 8),
    password: DEMO_PASSWORD,
  },
  {
    id: 'student-isaac-k',
    fullName: 'Isaac Kintu',
    email: 'isaac.k.demo@tutorug.ug',
    role: 'STUDENT',
    phone: '+256 786 113 552',
    bio: 'Form 5 student.',
    avatarUrl: null,
    createdAt: at(-30, 8),
    password: DEMO_PASSWORD,
  },
  {
    id: 'student-racheal',
    fullName: 'Racheal Nabbosa',
    email: 'racheal.demo@tutorug.ug',
    role: 'STUDENT',
    phone: '+256 750 998 331',
    bio: 'Senior 4 student.',
    avatarUrl: null,
    createdAt: at(-64, 8),
    password: DEMO_PASSWORD,
  },
  {
    id: 'student-peace',
    fullName: 'Peace Atuhaire',
    email: 'peace.demo@tutorug.ug',
    role: 'STUDENT',
    phone: '+256 703 447 120',
    bio: 'Form 5 student.',
    avatarUrl: null,
    createdAt: at(-18, 8),
    password: DEMO_PASSWORD,
  },
  {
    id: 'student-daniel-o',
    fullName: 'Daniel Okello',
    email: 'daniel.o.demo@tutorug.ug',
    role: 'STUDENT',
    phone: '+256 784 002 663',
    bio: 'Senior 6 candidate.',
    avatarUrl: null,
    createdAt: at(-90, 8),
    password: DEMO_PASSWORD,
  },
];

function userById(id: string): User {
  const found = USERS.find((user) => user.id === id);
  if (!found) {
    return {
      id,
      fullName: 'Unknown user',
      email: '',
      role: 'STUDENT',
      phone: null,
      bio: null,
      avatarUrl: null,
      createdAt: null,
    };
  }
  const { password: _password, ...safe } = found;
  return safe;
}

function tutorById(id: string): TutorSummary {
  return (
    TUTORS.find((tutor) => tutor.id === id) ?? {
      id,
      fullName: 'Unknown tutor',
      email: null,
      subjects: [],
      bio: null,
      hourlyRate: 0,
      rating: null,
      reviewCount: 0,
      sessionCount: 0,
      yearsExperience: null,
      location: null,
      avatarUrl: null,
    }
  );
}

function buildSessions(): Session[] {
  return [
    {
      id: 'session-001',
      student: userById('student-mary'),
      tutor: tutorById('tutor-001'),
      subject: 'Mathematics',
      scheduledAt: at(2, 10, 0),
      durationMinutes: 60,
      status: 'REQUESTED',
      message: 'I am stuck on quadratic equations and my CAT is next week. Could we focus on completing the square?',
      fee: 85000,
      notes: null,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      hasReview: false,
      reviewId: null,
      createdAt: at(-1, 18, 12),
      updatedAt: at(-1, 18, 12),
    },
    {
      id: 'session-002',
      student: userById('student-mary'),
      tutor: tutorById('tutor-003'),
      subject: 'English Literature',
      scheduledAt: at(-6, 14, 0),
      durationMinutes: 60,
      status: 'COMPLETED',
      message: 'Please help me structure my poetry analysis essay.',
      fee: 50000,
      notes: 'Reviewed the introduction and outline.',
      studentConfirmedAt: at(-6, 15, 30),
      tutorConfirmedAt: at(-6, 15, 35),
      hasReview: true,
      reviewId: 'review-001',
      createdAt: at(-9, 12, 5),
      updatedAt: at(-6, 15, 30),
    },
    {
      id: 'session-003',
      student: userById('student-mary'),
      tutor: tutorById('tutor-002'),
      subject: 'ICT',
      scheduledAt: at(5, 15, 30),
      durationMinutes: 60,
      status: 'ACCEPTED',
      message: 'We are covering databases in class and I need help with normalisation.',
      fee: 45000,
      notes: null,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      hasReview: false,
      reviewId: null,
      createdAt: at(-2, 9, 40),
      updatedAt: at(-1, 11, 0),
    },
    {
      id: 'session-004',
      student: userById('student-isaac-k'),
      tutor: tutorById('tutor-001'),
      subject: 'Physics',
      scheduledAt: at(1, 8, 0),
      durationMinutes: 90,
      status: 'REQUESTED',
      message: 'I need help with rotational dynamics before our physics test on Friday.',
      fee: 127500,
      notes: null,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      hasReview: false,
      reviewId: null,
      createdAt: at(-1, 20, 15),
      updatedAt: at(-1, 20, 15),
    },
    {
      id: 'session-005',
      student: userById('student-racheal'),
      tutor: tutorById('tutor-001'),
      subject: 'Mathematics',
      scheduledAt: at(-10, 16, 0),
      durationMinutes: 60,
      status: 'COMPLETED',
      message: 'Help with integration by parts.',
      fee: 85000,
      notes: 'Completed a full past paper walkthrough.',
      studentConfirmedAt: at(-10, 17, 10),
      tutorConfirmedAt: at(-10, 17, 20),
      hasReview: true,
      reviewId: 'review-002',
      createdAt: at(-14, 8, 20),
      updatedAt: at(-10, 17, 10),
    },
    {
      id: 'session-006',
      student: userById('student-peace'),
      tutor: tutorById('tutor-001'),
      subject: 'Chemistry',
      scheduledAt: at(3, 12, 0),
      durationMinutes: 60,
      status: 'REQUESTED',
      message: 'Balancing chemical equations is confusing me. Could we do a revision session?',
      fee: 85000,
      notes: null,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      hasReview: false,
      reviewId: null,
      createdAt: at(-1, 21, 30),
      updatedAt: at(-1, 21, 30),
    },
    {
      id: 'session-007',
      student: userById('student-daniel-o'),
      tutor: tutorById('tutor-001'),
      subject: 'Further Mathematics',
      scheduledAt: at(-20, 11, 0),
      durationMinutes: 60,
      status: 'CANCELLED',
      message: 'Vectors and matrices.',
      fee: 60000,
      notes: null,
      studentConfirmedAt: null,
      tutorConfirmedAt: null,
      hasReview: false,
      reviewId: null,
      createdAt: at(-25, 10, 0),
      updatedAt: at(-22, 9, 0),
    },
  ];
}

function buildReviews(): Review[] {
  return [
    {
      id: 'review-001',
      sessionId: 'session-002',
      tutorId: 'tutor-003',
      studentId: 'student-mary',
      studentName: 'Mary Namutebi',
      rating: 5,
      comment:
        'Grace explained how to structure an essay in a way that finally made sense. My mock scores improved immediately.',
      createdAt: at(-5, 19, 0),
    },
    {
      id: 'review-002',
      sessionId: 'session-005',
      tutorId: 'tutor-001',
      studentId: 'student-racheal',
      studentName: 'Racheal Nabbosa',
      rating: 5,
      comment:
        'Very patient and thorough. Sarah worked through every step with me instead of just telling me the answer.',
      createdAt: at(-9, 20, 0),
    },
    {
      id: 'review-003',
      sessionId: null,
      tutorId: 'tutor-001',
      studentId: null,
      studentName: 'Brian Kaggwa',
      rating: 5,
      comment: 'Sarah is one of the best mathematics peers I have studied with. Very well prepared.',
      createdAt: at(-12, 18, 0),
    },
    {
      id: 'review-004',
      sessionId: null,
      tutorId: 'tutor-001',
      studentId: null,
      studentName: 'Nadia Ssewanyana',
      rating: 4,
      comment: 'Great explanations. I would have liked a little more practice questions.',
      createdAt: at(-22, 16, 0),
    },
    {
      id: 'review-005',
      sessionId: null,
      tutorId: 'tutor-003',
      studentId: null,
      studentName: 'Ernest Lubowa',
      rating: 5,
      comment: 'Kind, patient and she genuinely cares about the students.',
      createdAt: at(-15, 17, 0),
    },
    {
      id: 'review-006',
      sessionId: null,
      tutorId: 'tutor-002',
      studentId: null,
      studentName: 'Fiona Namazzi',
      rating: 4,
      comment: 'Explains ICT clearly and gave me a lot of practice files to work with.',
      createdAt: at(-18, 15, 0),
    },
    {
      id: 'review-007',
      sessionId: null,
      tutorId: 'tutor-005',
      studentId: null,
      studentName: 'Samuel Okot',
      rating: 5,
      comment: 'Diagrams made biology finally make sense for me.',
      createdAt: at(-25, 14, 0),
    },
    {
      id: 'review-008',
      sessionId: null,
      tutorId: 'tutor-008',
      studentId: null,
      studentName: 'Annika Nsubuga',
      rating: 5,
      comment: 'Practical, hands-on sessions. I built my first working web app in three sessions.',
      createdAt: at(-8, 19, 0),
    },
  ];
}

/** Seed demo wallets so top-up, pay and withdraw can be tried immediately. */
function seedWallets(): Record<string, Wallet> {
  const now = new Date().toISOString();
  return {
    'student-mary': {
      userId: 'student-mary',
      availableBalance: 300000,
      escrowBalance: 0,
      currency: 'UGX',
      updatedAt: now,
    },
    'tutor-001': {
      userId: 'tutor-001',
      availableBalance: 185000,
      escrowBalance: 0,
      currency: 'UGX',
      updatedAt: now,
    },
  };
}

function seedTransactions(): WalletTransaction[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'txn-seed-001',
      userId: 'student-mary',
      type: 'TOP_UP',
      amount: 200000,
      balanceAfter: 200000,
      sessionId: null,
      description: 'Top-up via MTN MoMo',
      reference: 'MOMO-884120',
      createdAt: now,
    },
    {
      id: 'txn-seed-002',
      userId: 'student-mary',
      type: 'TOP_UP',
      amount: 100000,
      balanceAfter: 300000,
      sessionId: null,
      description: 'Top-up via Airtel Money',
      reference: 'AIRTEL-559013',
      createdAt: now,
    },
    {
      id: 'txn-seed-003',
      userId: 'tutor-001',
      type: 'SESSION_EARNING',
      amount: 72250,
      balanceAfter: 72250,
      sessionId: null,
      description: 'Session earnings released',
      reference: 'TUTORUG-10231',
      createdAt: now,
    },
    {
      id: 'txn-seed-004',
      userId: 'tutor-001',
      type: 'SESSION_EARNING',
      amount: 72250,
      balanceAfter: 144500,
      sessionId: null,
      description: 'Session earnings released',
      reference: 'TUTORUG-10744',
      createdAt: now,
    },
    {
      id: 'txn-seed-005',
      userId: 'tutor-001',
      type: 'SESSION_EARNING',
      amount: 40500,
      balanceAfter: 185000,
      sessionId: null,
      description: 'Session earnings released',
      reference: 'TUTORUG-11002',
      createdAt: now,
    },
  ];
}

/** Existing wallets created before this feature shipped. */
export function ensureWalletRecords(db: DemoDb): void {
  let changed = false;
  if (!db.wallets || typeof db.wallets !== 'object') {
    db.wallets = {};
    changed = true;
  }
  if (!Array.isArray(db.transactions)) {
    db.transactions = [];
    changed = true;
  }
  if (!db.escrows || typeof db.escrows !== 'object') {
    db.escrows = {};
    changed = true;
  }
  if (!Array.isArray(db.messages)) {
    db.messages = [];
    changed = true;
  }
  if (Object.keys(db.wallets).length === 0) {
    db.wallets = seedWallets();
    db.transactions = seedTransactions();
    changed = true;
  }
  if (!db.wallets['student-mary']) {
    db.wallets['student-mary'] = seedWallets()['student-mary'];
    changed = true;
  }
  if (!db.wallets['tutor-001']) {
    db.wallets['tutor-001'] = seedWallets()['tutor-001'];
    changed = true;
  }
  if (changed) writeStorage(db);
}

const AVAILABILITY_START = ['08:00', '09:00', '10:00', '14:00'];
const AVAILABILITY_END = ['17:00', '18:00', '19:00', '20:00'];

/** Give every demo tutor a realistic weekly schedule out of the box. */
function buildAvailability(index: number): AvailabilitySlot[] {
  const start = AVAILABILITY_START[index % AVAILABILITY_START.length];
  const end = AVAILABILITY_END[index % AVAILABILITY_END.length];
  return WEEK_DAYS.map((day, dayIndex) => ({
    day,
    enabled: dayIndex < 5 || (dayIndex === 5 && index % 2 === 0),
    start,
    end,
  }));
}

function seed(): DemoDb {
  return {
    users: USERS.map((user) => ({ ...user })),
    tutors: TUTORS.map((tutor, index) => ({
      ...tutor,
      availability: buildAvailability(index),
    })),
    reviews: buildReviews(),
    sessions: buildSessions(),
    messages: [],
    wallets: seedWallets(),
    transactions: seedTransactions(),
    escrows: {},
    currentUserId: null,
  };
}

let cache: DemoDb | null = null;

function readStorage(): DemoDb | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoDb;
    if (!parsed || !Array.isArray(parsed.users)) return null;
    ensureWalletRecords(parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(db: DemoDb): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* Storage unavailable — the in-memory copy still works for this tab. */
  }
}

/** The mutable demo database (lazily seeded, persisted per tab). */
export function getDb(): DemoDb {
  if (cache) return cache;
  cache = readStorage() ?? seed();
  ensureWalletRecords(cache);
  writeStorage(cache);
  return cache;
}

export function saveDb(): void {
  if (cache) writeStorage(cache);
}

/** Reset the demo database back to its seeded state. */
export function resetDb(): void {
  cache = seed();
  saveDb();
}

export function findUserByEmail(email: string): DemoUser | undefined {
  return getDb().users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): DemoUser | undefined {
  return getDb().users.find((user) => user.id === id);
}

export function findTutorById(id: string): TutorSummary | undefined {
  return getDb().tutors.find((tutor) => tutor.id === id);
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function toSafeUser(user: DemoUser): User {
  const { password: _password, ...safe } = user;
  return safe;
}

export function makeSession(
  student: User,
  tutor: TutorSummary,
  subject: string,
  scheduledAt: string,
  message: string | null,
  fee: number | null,
): Session {
  return {
    id: createId('session'),
    student,
    tutor,
    subject,
    scheduledAt,
    durationMinutes: 60,
    status: 'REQUESTED' as SessionStatus,
    message,
    fee,
    notes: null,
    studentConfirmedAt: null,
    tutorConfirmedAt: null,
    hasReview: false,
    reviewId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const DEMO_ROLE_STUDENT: UserRole = 'STUDENT';
