import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpen, Calendar, CalendarPlus,
  CheckCircle2, Clock, Flame, Search, Sparkles, Star, TrendingUp, Wallet, XCircle, Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { GettingStarted } from '@/components/dashboard/GettingStarted';
import { Skeleton } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { sessionIcsFilename, sessionIcsHref } from '@/utils/calendar';
import { firstName, formatRating, formatUGX } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';
import type { Session, WalletTransaction } from '@/types';

const VOLT = '#D4FF24';
const COBALT = '#1558C9';
const NIGHT = '#030407';
const DANGER = '#ff8080';

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const voltCard = { background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' };

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `in ${days} day${days !== 1 ? 's' : ''}`;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isTomorrow(dateStr: string) {
  const d = new Date(dateStr);
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  return d.getFullYear() === tom.getFullYear() && d.getMonth() === tom.getMonth() && d.getDate() === tom.getDate();
}

/** Monday 00:00 of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function weekKey(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const s = startOfWeek(d);
  return `${s.getFullYear()}-${s.getMonth()}-${s.getDate()}`;
}

function isThisWeek(dateStr: string): boolean {
  return weekKey(dateStr) === weekKey(new Date());
}

function hoursOf(sessions: Session[]): number {
  return sessions.reduce((total, s) => total + (s.durationMinutes ?? 60) / 60, 0);
}

/** Consecutive weeks (ending this week or last) that include a completed session. */
function learningStreak(completed: Session[]): number {
  if (completed.length === 0) return 0;
  const weeks = new Set(completed.map((s) => weekKey(s.scheduledAt)));
  let cursor = startOfWeek(new Date());
  if (!weeks.has(weekKey(cursor))) {
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
  }
  let count = 0;
  while (weeks.has(weekKey(cursor))) {
    count += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 7);
  }
  return count;
}

interface ActivityItem {
  id: string;
  icon: typeof CheckCircle2;
  color: string;
  text: string;
  time: string;
  at: number;
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** A merged, chronological feed of past session events and wallet movements. */
function buildActivity(sessions: Session[], transactions: WalletTransaction[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  const now = Date.now();

  sessions.forEach((s) => {
    const at = new Date(s.scheduledAt).getTime();
    if (!Number.isFinite(at)) return;
    const time = shortDate(s.scheduledAt);
    if (s.status === 'COMPLETED') {
      items.push({ id: s.id, icon: CheckCircle2, color: VOLT, text: `Completed ${s.subject} with ${s.tutor?.fullName}`, time, at });
    } else if (s.status === 'CANCELLED') {
      items.push({ id: s.id, icon: XCircle, color: DANGER, text: `Cancelled ${s.subject} session with ${s.tutor?.fullName}`, time, at });
    } else if (s.status === 'REJECTED') {
      items.push({ id: s.id, icon: XCircle, color: DANGER, text: `${s.subject} request was declined`, time, at });
    } else if (at < now) {
      items.push({ id: s.id, icon: Clock, color: 'rgba(255,255,255,0.4)', text: `${s.subject} session with ${s.tutor?.fullName}`, time, at });
    }
  });

  transactions.forEach((tx) => {
    const at = new Date(tx.createdAt ?? 0).getTime();
    if (!Number.isFinite(at) || !tx.createdAt) return;
    const time = shortDate(tx.createdAt);
    if (tx.type === 'TOP_UP') {
      items.push({ id: tx.id, icon: ArrowDownLeft, color: VOLT, text: `Topped up wallet ${formatUGX(tx.amount)}`, time, at });
    } else if (tx.type === 'WITHDRAWAL') {
      items.push({ id: tx.id, icon: ArrowUpRight, color: DANGER, text: `Withdrew ${formatUGX(Math.abs(tx.amount))} to mobile money`, time, at });
    } else if (tx.type === 'SESSION_PAYMENT' || tx.type === 'REFUND') {
      items.push({ id: tx.id, icon: Wallet, color: COBALT, text: tx.description, time, at });
    }
  });

  return items.sort((a, b) => b.at - a.at).slice(0, 6);
}

export function StudentDashboardNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/tutors?search=${encodeURIComponent(query)}` : '/tutors');
  };

  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const walletState = useAsyncData(() => services.wallet.getWallet(), []);
  const transactionsState = useAsyncData(() => services.wallet.listTransactions(), []);
  const tutorsState = useAsyncData(() => services.tutors.list({ size: 100 }), []);

  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);
  const transactions = useMemo<WalletTransaction[]>(() => transactionsState.data ?? [], [transactionsState.data]);

  const upcoming = useMemo(
    () => sessions.filter(isUpcoming).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );
  const pendingRequests = useMemo(() => sessions.filter((s) => s.status === 'REQUESTED'), [sessions]);
  const completed = useMemo(() => sessions.filter((s) => s.status === 'COMPLETED'), [sessions]);
  const reviewable = useMemo(() => completed.filter((s) => !s.hasReview), [completed]);

  const nextSession = upcoming[0] ?? null;
  const isNextSoon = nextSession && (isToday(nextSession.scheduledAt) || isTomorrow(nextSession.scheduledAt));

  const greetingName = firstName(user?.fullName);
  const hoursLearned = Math.round(hoursOf(completed));
  const activeTutors = new Set(completed.map((s) => s.tutor?.id).filter(Boolean)).size;
  const weeklyHours = Math.round(hoursOf(completed.filter((s) => isThisWeek(s.scheduledAt))));
  const streak = learningStreak(completed);

  const activity = useMemo(() => buildActivity(sessions, transactions), [sessions, transactions]);

  const subjectStats = useMemo(() => {
    const map = new Map<string, { hours: number; count: number }>();
    completed.forEach((s) => {
      const entry = map.get(s.subject) ?? { hours: 0, count: 0 };
      entry.hours += (s.durationMinutes ?? 60) / 60;
      entry.count += 1;
      map.set(s.subject, entry);
    });
    return Array.from(map.entries())
      .map(([subject, value]) => ({ subject, hours: Math.round(value.hours * 10) / 10, count: value.count }))
      .sort((a, b) => b.hours - a.hours);
  }, [completed]);
  const maxSubjectHours = subjectStats[0]?.hours ?? 1;

  const booked = useMemo(
    () => sessions.filter((s) => s.status === 'COMPLETED' || s.status === 'ACCEPTED' || s.status === 'REQUESTED'),
    [sessions],
  );
  const totalInvested = booked.reduce((total, s) => total + (s.fee ?? 0), 0);
  const avgFee = booked.length ? Math.round(totalInvested / booked.length) : 0;

  const recommended = useMemo(() => {
    const all = tutorsState.data?.content ?? [];
    const workedWith = new Set(sessions.map((s) => s.tutor?.id));
    const studied = new Set(sessions.map((s) => s.subject.toLowerCase()));
    const pool = all.filter((t) => !workedWith.has(t.id));
    const preferred = pool.filter((t) => t.subjects.some((subject) => studied.has(subject.toLowerCase())));
    const chosen = preferred.length > 0 ? preferred : pool;
    return [...chosen].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  }, [tutorsState.data, sessions]);

  const loading = sessionsState.loading && !sessionsState.data;

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, accent: COBALT, sub: upcoming.length > 0 ? `Next: ${timeUntil(upcoming[0].scheduledAt)}` : 'None scheduled' },
    { label: 'Completed', value: completed.length, icon: CheckCircle2, accent: VOLT, sub: completed.length > 0 ? '↑ Keep it up!' : 'Book your first' },
    { label: 'Hours learned', value: hoursLearned, icon: Clock, accent: COBALT, sub: weeklyHours > 0 ? `${weeklyHours}h this week` : 'Goal: 5 hrs/week' },
    { label: 'Tutors worked with', value: activeTutors, icon: Star, accent: VOLT, sub: activeTutors > 0 ? 'Across subjects' : 'Find your first' },
  ];

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Hero banner */}
          <div className="relative mb-6 overflow-hidden rounded-3xl p-5 sm:p-8" style={{ background: 'linear-gradient(135deg, #1558C9 0%, #0d3d8a 55%, #030407 100%)' }}>
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(212,255,36,0.07)' }} />
            <div className="absolute -bottom-12 right-32 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: VOLT }}>{timeGreeting()}</p>
                <h2 className="mt-1 break-words text-2xl font-black tracking-tight text-white sm:text-4xl">
                  Welcome back, {greetingName} 👋
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/60 sm:text-base">
                  {upcoming.length > 0
                    ? `You have ${upcoming.length} upcoming session${upcoming.length !== 1 ? 's' : ''}. Keep the momentum going.`
                    : 'Ready to learn? Find a tutor and book your next session.'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/tutors" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
                  <Search className="h-4 w-4" /> Find a tutor
                </Link>
                {walletState.data && (
                  <Link to="/wallet" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}>
                    <Wallet className="h-4 w-4" /> {formatUGX(walletState.data.availableBalance)}
                  </Link>
                )}
              </div>
            </div>
            <form onSubmit={submitSearch} className="relative mt-5 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search a course unit, e.g. Mathematics"
                  aria-label="Search for a tutor by course unit"
                  className="h-11 w-full rounded-xl pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40"
                  style={{ background: 'rgba(3,4,7,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              <button type="submit" className="rounded-xl px-5 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
                Search
              </button>
            </form>
          </div>

          <GettingStarted sessions={sessions} wallet={walletState.data} userId={user?.id} />

          {/* Action prompts */}
          {(pendingRequests.length > 0 || reviewable.length > 0) && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {pendingRequests.length > 0 && (
                <Link to="/sessions" className="flex items-center gap-4 rounded-2xl p-4 transition hover:opacity-95" style={{ background: 'rgba(21,88,201,0.14)', border: '1px solid rgba(21,88,201,0.4)' }}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(21,88,201,0.3)' }}>
                    <Clock className="h-5 w-5" style={{ color: VOLT }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} awaiting confirmation
                    </p>
                    <p className="text-xs text-white/50">A tutor will accept or decline shortly.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
                </Link>
              )}
              {reviewable.length > 0 && (
                <Link to={`/sessions/${reviewable[0].id}/feedback`} className="flex items-center gap-4 rounded-2xl p-4 transition hover:opacity-95" style={{ background: 'rgba(212,255,36,0.1)', border: '1px solid rgba(212,255,36,0.35)' }}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: VOLT }}>
                    <Star className="h-5 w-5" style={{ color: NIGHT }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">Rate your {reviewable[0].subject} session</p>
                    <p className="text-xs text-white/50">How did it go with {reviewable[0].tutor?.fullName}?</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
                </Link>
              )}
            </div>
          )}

          {/* Next session spotlight */}
          {isNextSoon && nextSession && (
            <div className="mb-6 flex items-center gap-4 rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.08)', border: '1px solid rgba(212,255,36,0.3)' }}>
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full" style={{ background: VOLT }}>
                <Zap className="h-6 w-6" style={{ color: NIGHT }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: VOLT }}>
                  {isToday(nextSession.scheduledAt) ? '🔥 Today' : '⏰ Tomorrow'}
                </p>
                <p className="truncate font-bold text-white">
                  {nextSession.subject} with {nextSession.tutor?.fullName}
                </p>
                <p className="text-xs text-white/50">
                  {new Date(nextSession.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {timeUntil(nextSession.scheduledAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <a
                  href={sessionIcsHref(nextSession)}
                  download={sessionIcsFilename(nextSession)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
                >
                  <CalendarPlus className="h-4 w-4" /> Add
                </a>
                <Link to={`/sessions/${nextSession.id}`} className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
                  View →
                </Link>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 transition hover:-translate-y-0.5 hover:scale-[1.02] sm:p-5" style={{ background: `linear-gradient(135deg, ${stat.accent}12 0%, rgba(21,88,201,0.06) 100%)`, border: `1px solid ${stat.accent}30` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/50">{stat.label}</p>
                    <p className="mt-1.5 truncate text-2xl font-black text-white sm:text-3xl">{stat.value}</p>
                    <p className="mt-1 text-xs text-white/40">{stat.sub}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${stat.accent}22`, boxShadow: `0 0 16px ${stat.accent}30` }}>
                    <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="min-w-0 space-y-6 lg:col-span-2">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Upcoming sessions</h3>
                  <Link to="/sessions" className="text-sm font-bold transition hover:opacity-80" style={{ color: VOLT }}>View all →</Link>
                </div>

                {upcoming.length === 0 ? (
                  <div className="rounded-2xl p-6 text-center sm:p-10" style={cardStyle}>
                    <Calendar className="mx-auto h-10 w-10 text-white/20" />
                    <p className="mt-3 font-semibold text-white">No upcoming sessions</p>
                    <p className="mt-1 text-sm text-white/50">Book a tutor to get started</p>
                    <Link to="/tutors" className="mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: VOLT, color: NIGHT }}>
                      Find a tutor <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.slice(0, 3).map((session) => (
                      <Link key={session.id} to={`/sessions/${session.id}`} className="flex items-center gap-4 rounded-2xl p-4 transition hover:scale-[1.01]" style={cardStyle}>
                        <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: COBALT, color: VOLT }}>
                          {session.tutor?.fullName?.charAt(0) ?? 'T'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{session.tutor?.fullName}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.3)', color: 'rgba(255,255,255,0.7)' }}>
                              {session.subject}
                            </span>
                            {session.status === 'REQUESTED' && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(212,255,36,0.15)', color: VOLT }}>
                                Awaiting
                              </span>
                            )}
                            <span className="text-xs text-white/40">
                              {new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-bold text-white">
                            {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold" style={{ color: VOLT }}>
                            {timeUntil(session.scheduledAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject progress */}
              {subjectStats.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <BookOpen className="h-5 w-5" style={{ color: VOLT }} /> Subject progress
                  </h3>
                  <div className="space-y-4 rounded-2xl p-5" style={cardStyle}>
                    {subjectStats.map((item) => (
                      <div key={item.subject}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-white">{item.subject}</p>
                          <p className="shrink-0 text-xs text-white/50">
                            {item.hours} hr{item.hours !== 1 ? 's' : ''} · {item.count} session{item.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(8, (item.hours / maxSubjectHours) * 100)}%`, background: `linear-gradient(90deg, ${COBALT}, ${VOLT})` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent activity */}
              {activity.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-bold text-white">Recent activity</h3>
                  <div className="overflow-hidden rounded-2xl" style={cardStyle}>
                    {activity.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3.5" style={idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.15)' } : {}}>
                        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: `${item.color}18` }}>
                          <item.icon className="h-4 w-4" style={{ color: item.color }} />
                        </div>
                        <p className="flex-1 truncate text-sm text-white/70">{item.text}</p>
                        <p className="flex-shrink-0 text-xs text-white/30">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="min-w-0">
              <h3 className="mb-4 text-lg font-bold text-white">Quick actions</h3>
              <div className="space-y-3">
                {upcoming.length === 0 ? (
                  <Link to="/tutors" className="flex items-center gap-4 rounded-2xl p-5 transition hover:opacity-90" style={{ background: VOLT }}>
                    <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: NIGHT }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: NIGHT }}>Book your first session</p>
                      <p className="text-xs" style={{ color: 'rgba(3,4,7,0.55)' }}>Find a tutor now</p>
                    </div>
                    <ArrowRight className="h-4 w-4" style={{ color: NIGHT }} />
                  </Link>
                ) : (
                  <Link to="/tutors" className="flex items-center gap-4 rounded-2xl p-5 transition hover:opacity-90" style={{ background: VOLT }}>
                    <Search className="h-5 w-5 flex-shrink-0" style={{ color: NIGHT }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: NIGHT }}>Find another tutor</p>
                      <p className="text-xs" style={{ color: 'rgba(3,4,7,0.55)' }}>Browse course units</p>
                    </div>
                    <ArrowRight className="h-4 w-4" style={{ color: NIGHT }} />
                  </Link>
                )}

                {[
                  { to: '/sessions', icon: Calendar, label: 'My sessions', sub: `${sessions.length} total` },
                  {
                    to: '/wallet',
                    icon: Wallet,
                    label: 'My wallet',
                    sub: walletState.data ? `${formatUGX(walletState.data.availableBalance)} available` : 'Top up or withdraw',
                    highlight: walletState.data && walletState.data.availableBalance < 5000,
                  },
                  { to: '/student/profile', icon: TrendingUp, label: 'My profile', sub: 'Update your details' },
                ].map(({ to, icon: Icon, label, sub, highlight }) => (
                  <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl p-4 transition hover:scale-[1.01]" style={highlight ? { background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)' } : cardStyle}>
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: highlight ? 'rgba(255,60,60,0.15)' : 'rgba(21,88,201,0.25)' }}>
                      <Icon className="h-5 w-5" style={{ color: highlight ? DANGER : COBALT }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="truncate text-xs" style={{ color: highlight ? DANGER : 'rgba(255,255,255,0.4)' }}>{sub}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/25" />
                  </Link>
                ))}
              </div>

              {/* Weekly goal */}
              <div className="mt-4 rounded-2xl p-5" style={voltCard}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold" style={{ color: VOLT }}>Weekly goal</p>
                  <p className="shrink-0 text-xs text-white/40">{Math.min(weeklyHours, 5)}/5 hrs</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((weeklyHours / 5) * 100, 100)}%`, background: VOLT }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-white/40">
                    {weeklyHours >= 5 ? '🎉 Goal reached this week!' : `${5 - Math.min(weeklyHours, 5)} more hours to hit your goal`}
                  </p>
                  {streak > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(212,255,36,0.15)', color: VOLT }}>
                      <Flame className="h-3 w-3" /> {streak}-week streak
                    </span>
                  )}
                </div>
              </div>

              {/* Invested in learning */}
              <div className="mt-3 rounded-2xl p-4" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/60">Invested in learning</p>
                  <TrendingUp className="h-4 w-4" style={{ color: VOLT }} />
                </div>
                <p className="mt-1 text-xl font-black text-white">{formatUGX(totalInvested)}</p>
                <p className="text-xs text-white/40">
                  Across {booked.length} booked session{booked.length !== 1 ? 's' : ''} · avg {formatUGX(avgFee)}
                </p>
              </div>

              {/* Recommended tutors */}
              {recommended.length > 0 && (
                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Recommended for you</h3>
                    <Link to="/tutors" className="text-xs font-bold" style={{ color: VOLT }}>Browse →</Link>
                  </div>
                  <div className="space-y-2">
                    {recommended.map((tutor) => (
                      <Link key={tutor.id} to={`/tutors/${tutor.id}`} className="flex items-center gap-3 rounded-2xl p-3 transition hover:scale-[1.01]" style={cardStyle}>
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: COBALT, color: VOLT }}>
                          {tutor.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{tutor.fullName}</p>
                          <p className="truncate text-xs text-white/45">{tutor.subjects.slice(0, 2).join(' · ')}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="flex items-center justify-end gap-1 text-xs font-bold text-white">
                            <Star className="h-3 w-3" style={{ color: VOLT }} /> {formatRating(tutor.rating)}
                          </p>
                          <p className="text-xs text-white/45">{formatUGX(tutor.hourlyRate)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.2)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/60">Payments secured</p>
                  <span className="text-xs font-bold" style={{ color: VOLT }}>{formatUGX(walletState.data?.escrowBalance ?? 0)} in escrow</span>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  Pay with MTN MoMo or Airtel Money. Your fee is held in escrow by TutorUG and only released to the tutor after the session is completed and confirmed.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
