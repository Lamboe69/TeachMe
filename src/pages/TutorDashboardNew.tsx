import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Wallet,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { firstName, formatUGX } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';
import type { Session } from '@/types';

export function TutorDashboardNew() {
  const { user } = useAuth();
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const walletState = useAsyncData(() => services.wallet.getWallet(), []);

  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const upcoming = useMemo(
    () =>
      sessions
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const greetingName = firstName(user?.fullName);
  const pending = sessions.filter((s) => s.status === 'REQUESTED');

  // Earnings from sessions completed this calendar month
  const thisMonthEarnings = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => {
        if (s.status !== 'COMPLETED') return false;
        const d = new Date(s.scheduledAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, s) => sum + (s.fee ?? 0), 0);
  }, [sessions]);

  return (
    <AppShell title="Tutor Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
          Hello, {greetingName} 👋
        </h2>
        <p className="mt-2 text-lg text-ink-700">Manage your sessions and grow your earnings</p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending requests', value: pending.length, icon: Users, color: 'amber' },
          { label: 'Upcoming sessions', value: upcoming.length, icon: Calendar, color: 'green' },
          { label: 'Total sessions', value: sessions.length, icon: BookOpen, color: 'amber' },
          {
            label: 'This month',
            value: formatUGX(thisMonthEarnings),
            icon: DollarSign,
            color: 'green',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-black text-ink-950">{stat.value}</p>
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
            <h3 className="text-xl font-bold text-ink-950">Session requests</h3>
            <Link to="/sessions" className="text-sm font-semibold text-green-700 hover:underline">
              View all
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
              <Users className="mx-auto h-12 w-12 text-ink-400" />
              <p className="mt-4 font-semibold text-ink-900">No pending requests</p>
              <p className="mt-1 text-sm text-ink-600">New requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.slice(0, 3).map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-amber-200 transition hover:shadow-xl"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-lg font-bold text-white">
                    {session.student?.fullName?.charAt(0) ?? 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink-950">{session.student?.fullName}</p>
                    <p className="text-sm text-ink-600">{session.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-900">
                      {new Date(session.scheduledAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <span className="text-xs font-bold text-amber-700">Awaiting response</span>
                  </div>
                </Link>
              ))}
              {pending.length > 3 && (
                <Link
                  to="/sessions"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-green-200 text-sm font-semibold text-green-700 hover:underline"
                >
                  View {pending.length - 3} more request{pending.length - 3 > 1 ? 's' : ''}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-ink-950">Quick actions</h3>
          </div>
          <div className="space-y-3">
            <Link
              to="/tutor/profile/edit"
              className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg transition hover:shadow-xl"
            >
              <Users className="h-6 w-6" />
              <div className="flex-1">
                <p className="font-bold">Complete profile</p>
                <p className="text-sm text-white/90">Add course units</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/sessions"
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
            >
              <Calendar className="h-6 w-6 text-green-700" />
              <div className="flex-1">
                <p className="font-bold text-ink-950">Manage sessions</p>
                <p className="text-sm text-ink-600">Accept / decline</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400" />
            </Link>
            <Link
              to="/tutor/availability"
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
            >
              <Clock className="h-6 w-6 text-green-700" />
              <div className="flex-1">
                <p className="font-bold text-ink-950">Set availability</p>
                <p className="text-sm text-ink-600">Update schedule</p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400" />
            </Link>
            <Link
              to="/wallet"
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl"
            >
              <Wallet className="h-6 w-6 text-green-700" />
              <div className="flex-1">
                <p className="font-bold text-ink-950">Wallet & withdrawals</p>
                <p className="text-sm text-ink-600">
                  {walletState.data ? formatUGX(walletState.data.availableBalance) : '—'} available · top up or withdraw
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-400" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
