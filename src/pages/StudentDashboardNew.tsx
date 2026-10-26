import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, Clock, Search, Star, Wallet } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { firstName } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';
import type { Session } from '@/types';

export function StudentDashboardNew() {
  const { user } = useAuth();
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const upcoming = useMemo(
    () =>
      sessions
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const greetingName = firstName(user?.fullName);

  return (
    <AppShell title="Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
          Welcome back, {greetingName} 👋
        </h2>
        <p className="mt-2 text-lg text-ink-700">
          Continue your learning journey with your study partners
        </p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Upcoming sessions', value: upcoming.length, icon: Calendar, color: 'green' },
          { label: 'Total sessions', value: sessions.length, icon: BookOpen, color: 'amber' },
          {
            label: 'Hours learned',
            value: Math.round(
              sessions.reduce((t, s) => t + (s.durationMinutes ?? 60) / 60, 0),
            ),
            icon: Clock,
            color: 'green',
          },
          {
            label: 'Active tutors',
            value: new Set(sessions.map((s) => s.tutor?.id)).size,
            icon: Star,
            color: 'amber',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-black text-ink-950">{stat.value}</p>
              </div>
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${stat.color === 'green' ? 'bg-green-100' : 'bg-amber-100'}`}
              >
                <stat.icon
                  className={`h-6 w-6 ${stat.color === 'green' ? 'text-green-700' : 'text-amber-700'}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-ink-950">Upcoming sessions</h3>
            <Link to="/sessions" className="text-sm font-semibold text-green-700 hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
              <Calendar className="mx-auto h-12 w-12 text-ink-400" />
              <p className="mt-4 font-semibold text-ink-900">No upcoming sessions</p>
              <p className="mt-1 text-sm text-ink-600">Book a tutor to get started</p>
              <Link
                to="/tutors"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-bold text-white"
              >
                Find a tutor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.slice(0, 3).map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-lg font-bold text-white">
                    {session.tutor?.fullName?.charAt(0) ?? 'T'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink-950">{session.tutor?.fullName}</p>
                    <p className="text-sm text-ink-600">{session.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-900">
                      {new Date(session.scheduledAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-sm text-ink-600">
                      {new Date(session.scheduledAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-ink-950">Quick actions</h3>
          </div>
          <div className="space-y-3">
            <Link
              to="/tutors"
              className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg transition hover:shadow-xl"
            >
              <Search className="h-6 w-6" />
              <div className="flex-1">
                <p className="font-bold">Find a tutor</p>
                <p className="text-sm text-white/90">Browse course units</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/sessions"
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
            >
              <Calendar className="h-6 w-6 text-green-700" />
              <div className="flex-1">
                <p className="font-bold text-ink-950">My sessions</p>
                <p className="text-sm text-ink-600">View all sessions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400" />
            </Link>
            <Link
              to="/wallet"
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
            >
              <Wallet className="h-6 w-6 text-green-700" />
              <div className="flex-1">
                <p className="font-bold text-ink-950">My wallet</p>
                <p className="text-sm text-ink-600">Top up or withdraw</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400" />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 ring-1 ring-amber-200">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
                <Wallet className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Payments secured</p>
                <p className="text-sm text-amber-800">MTN MoMo & Airtel Money</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-amber-900">
              Money held by TutorUG until session complete
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
