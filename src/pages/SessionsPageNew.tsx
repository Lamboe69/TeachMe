import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { SESSION_STATUS_META } from '@/utils/sessionPermissions';
import type { Session, SessionStatus } from '@/types';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'REJECTED', label: 'Rejected' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  accepted:  { bg: 'rgba(21,88,201,0.18)',   color: '#7eb3ff',  border: '#1558C9' },
  pending:   { bg: 'rgba(212,255,36,0.12)',  color: '#D4FF24',  border: '#D4FF24' },
  completed: { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80',  border: '#22c55e' },
  cancelled: { bg: 'rgba(255,60,60,0.12)',   color: '#ff8080',  border: '#ef4444' },
  unknown:   { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.15)' },
};

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };

export function SessionsPageNew() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const tabs = TABS.map((tab) => ({
    ...tab,
    count: tab.id === 'ALL' ? sessions.length : sessions.filter((s) => s.status === (tab.id as SessionStatus)).length,
  }));

  const sorted = useMemo(() => {
    const filtered = activeTab === 'ALL' ? sessions : sessions.filter((s) => s.status === activeTab);
    return [...filtered].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [sessions, activeTab]);

  return (
    <AppShell title="Sessions">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold" style={{ color: '#D4FF24' }}>Your sessions</p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My sessions</h2>
          <p className="mt-2 text-white/55">Track and manage all your tutoring sessions</p>
        </div>
        <Link
          to="/tutors"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90 shrink-0"
          style={{ background: '#D4FF24', color: '#030407' }}
        >
          <Plus className="h-4 w-4" />
          Book a session
        </Link>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl p-2" style={cardStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
            style={activeTab === tab.id
              ? { background: '#D4FF24', color: '#030407' }
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

      {sorted.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={cardStyle}>
          <Calendar className="mx-auto h-12 w-12 text-white/20" />
          <h3 className="mt-4 text-xl font-bold text-white">No sessions yet</h3>
          <p className="mt-2 text-white/50">Browse the tutor directory and request your first session</p>
          <Link
            to="/tutors"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90"
            style={{ background: '#D4FF24', color: '#030407' }}
          >
            Find a tutor <Plus className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          {sorted.map((session, idx) => {
            const meta = SESSION_STATUS_META[session.status] ?? SESSION_STATUS_META.UNKNOWN;
            const counterpart = session.student.id === user?.id ? session.tutor : session.student;
            const statusStyle = STATUS_STYLE[meta.tone] ?? STATUS_STYLE.unknown;
            const rowInitials = (() => { const p = (counterpart?.fullName ?? 'U').trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (counterpart?.fullName ?? 'U').slice(0, 2).toUpperCase(); })();
            const AVATAR_COLORS = ['#1558C9','#7c3aed','#0891b2','#b45309','#be185d'];
            const avatarBg = AVATAR_COLORS[(counterpart?.fullName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
            return (
              <Link
                key={session.id}
                to={`/sessions/${session.id}`}
                className="flex flex-col gap-3 p-5 transition-all duration-200 sm:flex-row sm:items-center"
                style={{
                  ...(idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.12)' } : {}),
                  boxShadow: `inset 4px 0 0 ${statusStyle.border}`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${statusStyle.border}12`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: avatarBg, color: '#D4FF24' }}>
                  {rowInitials}
                </div>
                {/* Name + subject pill */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-white">{counterpart?.fullName}</h4>
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
                {/* Status badge */}
                <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                  {meta.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
