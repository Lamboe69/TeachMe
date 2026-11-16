import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarPlus, Clock, Plus, Search } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { sessionIcsFilename, sessionIcsHref } from '@/utils/calendar';
import { formatRelative } from '@/utils/format';
import { isUpcoming, SESSION_STATUS_META } from '@/utils/sessionPermissions';
import { Skeleton } from '@/components/ui/Spinner';
import type { Session, SessionStatus } from '@/types';

const VOLT = '#D4FF24';
const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'REJECTED', label: 'Rejected' },
];

const SORTS = [
  { value: 'upcoming', label: 'Upcoming first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  accepted:  { bg: 'rgba(21,88,201,0.18)',   color: '#7eb3ff',  border: '#1558C9' },
  pending:   { bg: 'rgba(212,255,36,0.12)',  color: '#D4FF24',  border: '#D4FF24' },
  completed: { bg: 'rgba(212,255,36,0.12)',  color: '#D4FF24',  border: '#D4FF24' },
  cancelled: { bg: 'rgba(255,60,60,0.12)',   color: '#ff8080',  border: '#ef4444' },
  neutral:   { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.15)' },
  unknown:   { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.15)' },
};

const HINT_STYLE: Record<'volt' | 'cobalt', { bg: string; color: string }> = {
  volt:   { bg: 'rgba(212,255,36,0.12)', color: VOLT },
  cobalt: { bg: 'rgba(21,88,201,0.18)',  color: '#7eb3ff' },
};

const AVATAR_COLORS = ['#1558C9', '#7c3aed', '#0891b2', '#b45309', '#be185d'];
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const selectStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(21,88,201,0.4)',
  colorScheme: 'dark' as const,
};

function timeOf(session: Session): number {
  return new Date(session.scheduledAt).getTime();
}

function counterpartOf(session: Session, userId: string | undefined) {
  return session.student.id === userId ? session.tutor : session.student;
}

function avatarBg(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

function rowInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

/** The one thing the user should do next with this session, if anything. */
function nextAction(session: Session, isTutor: boolean): { label: string; tone: 'volt' | 'cobalt' } | null {
  if (session.status === 'REQUESTED') {
    return isTutor ? { label: 'Needs your response', tone: 'volt' } : { label: 'Awaiting tutor', tone: 'cobalt' };
  }
  if (session.status === 'ACCEPTED') {
    if (!isPast(session)) return { label: formatRelative(session.scheduledAt), tone: 'cobalt' };
    const confirmed = isTutor ? session.tutorConfirmedAt : session.studentConfirmedAt;
    return confirmed ? null : { label: 'Confirm it happened', tone: 'volt' };
  }
  if (session.status === 'COMPLETED' && !isTutor && !session.hasReview) {
    return { label: 'Leave a review', tone: 'volt' };
  }
  return null;
}

function isPast(session: Session): boolean {
  const time = timeOf(session);
  return Number.isFinite(time) ? time < Date.now() : false;
}

function sortSessions(sessions: Session[], key: string): Session[] {
  const copy = [...sessions];
  if (key === 'newest') return copy.sort((a, b) => timeOf(b) - timeOf(a));
  if (key === 'oldest') return copy.sort((a, b) => timeOf(a) - timeOf(b));
  const now = Date.now();
  const upcoming = copy.filter((s) => timeOf(s) >= now).sort((a, b) => timeOf(a) - timeOf(b));
  const past = copy.filter((s) => timeOf(s) < now).sort((a, b) => timeOf(b) - timeOf(a));
  return [...upcoming, ...past];
}

function matchesSearch(session: Session, query: string, userId: string | undefined): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const counterpart = counterpartOf(session, userId);
  return `${counterpart?.fullName ?? ''} ${session.subject}`.toLowerCase().includes(needle);
}

export function SessionsPageNew() {
  const { user } = useAuth();
  const isTutor = user?.role === 'TUTOR';
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('upcoming');
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const tabs = useMemo(() => TABS.map((tab) => ({
    ...tab,
    count: tab.id === 'ALL' ? sessions.length : sessions.filter((s) => s.status === (tab.id as SessionStatus)).length,
  })), [sessions]);

  const visible = useMemo(() => {
    const byTab = activeTab === 'ALL' ? sessions : sessions.filter((s) => s.status === activeTab);
    const searched = byTab.filter((s) => matchesSearch(s, searchInput, user?.id));
    return sortSessions(searched, sortKey);
  }, [sessions, activeTab, searchInput, sortKey, user?.id]);

  const searching = searchInput.trim() !== '';

  return (
    <AppShell title="Sessions">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold" style={{ color: VOLT }}>Your sessions</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My sessions</h2>
          <p className="mt-2 text-white/55">Track and manage all your tutoring sessions in one place</p>
        </div>
        <Link
          to="/tutors"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90 shrink-0"
          style={{ background: VOLT, color: '#030407' }}
        >
          <Plus className="h-4 w-4" />
          Book a session
        </Link>
      </div>

      {/* Search + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="Search by tutor name or course unit…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search your sessions"
            className="h-12 w-full rounded-xl pl-11 pr-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' }}
          />
        </div>
        <select
          aria-label="Sort sessions by"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="h-12 rounded-xl px-4 text-sm font-semibold text-white outline-none transition focus:ring-2 focus:ring-[#1558C9] sm:w-52"
          style={selectStyle}
        >
          {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Filter sessions by status" className="mb-6 flex flex-wrap gap-2 rounded-2xl p-2" style={cardStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
            style={activeTab === tab.id
              ? { background: VOLT, color: '#030407' }
              : { color: 'rgba(255,255,255,0.5)', background: 'transparent' }
            }
          >
            {tab.label}
            <span className="rounded-full px-1.5 py-0.5 text-xs" style={activeTab === tab.id
              ? { background: 'rgba(3,4,7,0.2)', color: '#030407' }
              : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
            }>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {sessionsState.loading && !sessionsState.data && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      )}

      {sessionsState.data && (
        <>
          <p aria-live="polite" className="mb-4 text-sm font-semibold text-white/50">
            {visible.length} session{visible.length !== 1 ? 's' : ''}
            {activeTab !== 'ALL' ? ` · ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}` : ''}
          </p>

          {visible.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={cardStyle}>
              <Calendar className="mx-auto h-12 w-12 text-white/20" />
              {sessions.length === 0 ? (
                <>
                  <h3 className="mt-4 text-xl font-bold text-white">No sessions yet</h3>
                  <p className="mt-2 text-white/50">Browse the tutor directory and request your first session</p>
                  <Link
                    to="/tutors"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90"
                    style={{ background: VOLT, color: '#030407' }}
                  >
                    Find a tutor <Plus className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {searching ? 'No sessions match your search' : `No ${activeTab.toLowerCase()} sessions`}
                  </h3>
                  <p className="mt-2 text-white/50">
                    {searching ? 'Try a different name or course unit.' : 'Nothing here right now — check another tab.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setActiveTab('ALL'); }}
                    className="mt-6 rounded-xl px-6 py-2 text-sm font-semibold transition hover:opacity-80"
                    style={{ background: 'rgba(21,88,201,0.3)', border: '1px solid rgba(21,88,201,0.5)', color: 'white' }}
                  >
                    Show all sessions
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl" style={cardStyle}>
              {visible.map((session, idx) => {
                const meta = SESSION_STATUS_META[session.status] ?? SESSION_STATUS_META.UNKNOWN;
                const counterpart = counterpartOf(session, user?.id);
                const name = counterpart?.fullName ?? 'User';
                const statusStyle = STATUS_STYLE[meta.tone] ?? STATUS_STYLE.neutral;
                const hint = nextAction(session, isTutor);
                const canAddToCalendar = session.status === 'ACCEPTED' && isUpcoming(session);
                return (
                  <div
                    key={session.id}
                    className="relative flex flex-col gap-3 p-5 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-center"
                    style={{
                      ...(idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.12)' } : {}),
                      boxShadow: `inset 4px 0 0 ${statusStyle.border}`,
                    }}
                  >
                    <Link
                      to={`/sessions/${session.id}`}
                      className="absolute inset-0 z-0"
                      aria-label={`View ${session.subject} session with ${name}`}
                    />

                    {/* Avatar */}
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: avatarBg(name), color: VOLT }}>
                      {rowInitials(name)}
                    </div>

                    {/* Name + subject pill */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white">{name}</h4>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.3)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(21,88,201,0.5)' }}>
                          {session.subject}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/35">{session.student.id === user?.id ? 'Tutor' : 'Student'}</p>
                    </div>

                    {/* Date + time */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Next action hint */}
                    {hint && (
                      <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: HINT_STYLE[hint.tone].bg, color: HINT_STYLE[hint.tone].color }}>
                        {hint.label}
                      </span>
                    )}

                    {/* Status badge */}
                    <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {meta.label}
                    </span>

                    {/* Add to calendar (upcoming confirmed sessions only) */}
                    {canAddToCalendar && (
                      <a
                        href={sessionIcsHref(session)}
                        download={sessionIcsFilename(session)}
                        className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white"
                        style={{ border: '1px solid rgba(21,88,201,0.35)' }}
                        aria-label={`Add ${session.subject} session to calendar`}
                        title="Add to calendar"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
