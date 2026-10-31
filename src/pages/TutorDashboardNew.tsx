import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Calendar, CheckCircle2,
  Clock, DollarSign, TrendingUp, Users, Wallet, Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { firstName, formatUGX } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';
import type { Session } from '@/types';

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

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };

export function TutorDashboardNew() {
  const { user } = useAuth();
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const walletState = useAsyncData(() => services.wallet.getWallet(), []);

  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);
  const upcoming = useMemo(
    () => sessions.filter(isUpcoming).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const greetingName = firstName(user?.fullName);
  const pending = sessions.filter((s) => s.status === 'REQUESTED');
  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;

  const nextSession = upcoming[0] ?? null;
  const isNextSoon = nextSession && (isToday(nextSession.scheduledAt) || isTomorrow(nextSession.scheduledAt));

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

  const recentActivity = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        icon: s.status === 'COMPLETED' ? CheckCircle2 : s.status === 'REQUESTED' ? Users : Calendar,
        color: s.status === 'COMPLETED' ? '#D4FF24' : s.status === 'REQUESTED' ? '#ff9f43' : '#1558C9',
        text: s.status === 'COMPLETED'
          ? `Completed ${s.subject} with ${s.student?.fullName} · ${formatUGX(s.fee ?? 0)} earned`
          : s.status === 'REQUESTED'
          ? `New request: ${s.subject} from ${s.student?.fullName}`
          : `${s.subject} session with ${s.student?.fullName}`,
        time: new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      }));
  }, [sessions]);

  return (
    <AppShell title="Tutor Dashboard">
      {/* Hero banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl p-5 sm:p-8" style={{ background: 'linear-gradient(135deg, #1558C9 0%, #0d3d8a 55%, #030407 100%)' }}>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(212,255,36,0.07)' }} />
        <div className="absolute -bottom-12 right-32 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#D4FF24' }}>{timeGreeting()}, tutor</p>
            <h2 className="mt-1 break-words text-2xl font-black tracking-tight text-white sm:text-4xl">
              Hello, {greetingName} 👋
            </h2>
            <p className="mt-2 text-sm text-white/60 max-w-md sm:text-base">
              {pending.length > 0
                ? `You have ${pending.length} pending request${pending.length !== 1 ? 's' : ''} waiting for your response.`
                : `You have ${upcoming.length} upcoming session${upcoming.length !== 1 ? 's' : ''}. Keep teaching!`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/sessions" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
              <Users className="h-4 w-4" />
              {pending.length > 0 ? `${pending.length} Request${pending.length !== 1 ? 's' : ''}` : 'Sessions'}
            </Link>
            {walletState.data && (
              <Link to="/wallet" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}>
                <Wallet className="h-4 w-4" /> {formatUGX(walletState.data.availableBalance)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Next session spotlight */}
      {isNextSoon && nextSession && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.08)', border: '1px solid rgba(212,255,36,0.3)' }}>
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full" style={{ background: '#D4FF24' }}>
            <Zap className="h-6 w-6" style={{ color: '#030407' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4FF24' }}>
              {isToday(nextSession.scheduledAt) ? '🔥 Teaching today' : '⏰ Teaching tomorrow'}
            </p>
            <p className="font-bold text-white truncate">
              {nextSession.subject} · {nextSession.student?.fullName}
            </p>
            <p className="text-xs text-white/50">
              {new Date(nextSession.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {timeUntil(nextSession.scheduledAt)}
            </p>
          </div>
          <Link to={`/sessions/${nextSession.id}`} className="shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
            View →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending requests', value: pending.length, icon: Users, accent: '#D4FF24', sub: pending.length > 0 ? '⚡ Needs response' : 'All clear' },
          { label: 'Upcoming sessions', value: upcoming.length, icon: Calendar, accent: '#1558C9', sub: upcoming.length > 0 ? `Next: ${timeUntil(upcoming[0]?.scheduledAt)}` : 'None scheduled' },
          { label: 'Sessions completed', value: completedCount, icon: BookOpen, accent: '#D4FF24', sub: completedCount > 0 ? '↑ Great work!' : 'Accept requests' },
          { label: 'This month', value: formatUGX(thisMonthEarnings), icon: DollarSign, accent: '#1558C9', sub: 'Via MTN / Airtel MoMo' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4 transition hover:scale-[1.02] hover:-translate-y-0.5 sm:p-5" style={{ background: `linear-gradient(135deg, ${stat.accent}12 0%, rgba(21,88,201,0.06) 100%)`, border: `1px solid ${stat.accent}30` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white/50">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-black text-white truncate">{stat.value}</p>
                <p className="mt-1 text-xs text-white/40">{stat.sub}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${stat.accent}22`, boxShadow: `0 0 16px ${stat.accent}30` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {/* Session requests — richer rows */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Session requests</h3>
              <Link to="/sessions" className="text-sm font-bold transition hover:opacity-80" style={{ color: '#D4FF24' }}>View all →</Link>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl p-6 text-center sm:p-10" style={cardStyle}>
                <Users className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 font-semibold text-white">No pending requests</p>
                <p className="mt-1 text-sm text-white/50">New requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 3).map((session) => (
                  <Link key={session.id} to={`/sessions/${session.id}`} className="flex items-center gap-4 rounded-2xl p-4 transition hover:scale-[1.01]" style={cardStyle}>
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: 'rgba(212,255,36,0.15)', color: '#D4FF24' }}>
                      {session.student?.fullName?.charAt(0) ?? 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{session.student?.fullName}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.3)', color: 'rgba(255,255,255,0.7)' }}>
                          {session.subject}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 max-w-[90px]">
                      <p className="text-sm font-bold text-white">
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <span className="text-xs font-bold leading-tight" style={{ color: '#D4FF24' }}>Pending</span>
                    </div>
                  </Link>
                ))}
                {pending.length > 3 && (
                  <Link to="/sessions" className="flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold transition hover:opacity-80" style={{ ...cardStyle, color: '#D4FF24' }}>
                    View {pending.length - 3} more <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Recent activity</h3>
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                {recentActivity.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5" style={idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.15)' } : {}}>
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: `${item.color}18` }}>
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <p className="flex-1 text-sm text-white/70 truncate">{item.text}</p>
                    <p className="text-xs text-white/30 flex-shrink-0">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contextual quick actions */}
        <div className="min-w-0">
          <h3 className="mb-4 text-lg font-bold text-white">Quick actions</h3>
          <div className="space-y-3">
            <Link to="/tutor/profile/edit" className="flex items-center gap-4 rounded-2xl p-5 transition hover:opacity-90" style={{ background: '#D4FF24' }}>
              <TrendingUp className="h-5 w-5 flex-shrink-0" style={{ color: '#030407' }} />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: '#030407' }}>Complete profile</p>
                <p className="text-xs" style={{ color: 'rgba(3,4,7,0.55)' }}>Add course units & rate</p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: '#030407' }} />
            </Link>

            {[
              { to: '/sessions', icon: Calendar, label: 'Manage sessions', sub: `${pending.length} pending · ${upcoming.length} upcoming` },
              { to: '/tutor/availability', icon: Clock, label: 'Set availability', sub: 'Update your schedule' },
              {
                to: '/wallet',
                icon: Wallet,
                label: 'Wallet & withdrawals',
                sub: walletState.data ? `${formatUGX(walletState.data.availableBalance)} available` : 'Top up or withdraw',
              },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl p-4 transition hover:scale-[1.01]" style={cardStyle}>
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(21,88,201,0.25)' }}>
                  <Icon className="h-5 w-5" style={{ color: '#1558C9' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs text-white/40 truncate">{sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/25" />
              </Link>
            ))}
          </div>

          {/* Earnings progress */}
          <div className="mt-4 rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm font-bold truncate" style={{ color: '#D4FF24' }}>Monthly earnings</p>
              <p className="text-xs text-white/40 shrink-0">{formatUGX(thisMonthEarnings)}</p>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((thisMonthEarnings / 100000) * 100, 100)}%`, background: '#D4FF24' }} />
            </div>
            <p className="mt-2 text-xs text-white/40">
              {thisMonthEarnings >= 100000 ? '🎉 Goal reached!' : `${formatUGX(Math.max(0, 100000 - thisMonthEarnings))} to UGX 100k goal`}
            </p>
          </div>

          <div className="mt-3 rounded-2xl p-4" style={cardStyle}>
            <p className="text-xs font-bold text-white/60">MoMo payments</p>
            <p className="mt-1 text-xs text-white/35">Earnings land in your wallet the same day a session is marked complete.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
