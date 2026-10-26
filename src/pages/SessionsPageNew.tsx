import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { SESSION_STATUS_META } from '@/utils/sessionPermissions';
import type { Session, SessionStatus } from '@/types';

const TABS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
  { id: 'REJECTED', label: 'Rejected' },
];

export function SessionsPageNew() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const tabs = TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'ALL'
        ? sessions.length
        : sessions.filter((s) => s.status === (tab.id as SessionStatus)).length,
  }));

  const sorted = useMemo(() => {
    const filtered =
      activeTab === 'ALL' ? sessions : sessions.filter((s) => s.status === activeTab);
    return [...filtered].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  }, [sessions, activeTab]);

  return (
    <AppShell title="Sessions">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
            My sessions
          </h2>
          <p className="mt-2 text-lg text-ink-700">Track and manage all your tutoring sessions</p>
        </div>
        <Link
          to="/tutors"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Book a session
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-green-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-ink-700 hover:bg-green-50'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-ink-100'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
          <Calendar className="mx-auto h-16 w-16 text-ink-400" />
          <h3 className="mt-4 text-xl font-bold text-ink-950">No sessions yet</h3>
          <p className="mt-2 text-ink-700">
            Browse the tutor directory and request your first session
          </p>
          <Link
            to="/tutors"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-bold text-white"
          >
            Find a tutor
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((session) => {
            const meta = SESSION_STATUS_META[session.status] ?? SESSION_STATUS_META.UNKNOWN;
            const counterpart = session.student.id === user?.id ? session.tutor : session.student;
            return (
              <Link
                key={session.id}
                to={`/sessions/${session.id}`}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl sm:flex-row sm:items-center"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-lg font-bold text-white">
                  {counterpart?.fullName?.charAt(0) ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate font-bold text-ink-950">{counterpart?.fullName}</h4>
                  <p className="text-sm text-ink-600">{session.subject}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-ink-700">
                    <Calendar className="h-4 w-4" />
                    {new Date(session.scheduledAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-ink-700">
                    <Clock className="h-4 w-4" />
                    {new Date(session.scheduledAt).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    meta.tone === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : meta.tone === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : meta.tone === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : meta.tone === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-ink-100 text-ink-700'
                  }`}
                >
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
