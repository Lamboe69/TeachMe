import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Calendar, CheckCircle2,
  Clock, Search, Sparkles, Star, TrendingUp, Wallet, Zap,
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

export function StudentDashboardNew() {
  const { user } = useAuth();
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const walletState = useAsyncData(() => services.wallet.getWallet(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);

  const upcoming = useMemo(
    () => sessions.filter(isUpcoming).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const nextSession = upcoming[0] ?? null;
  const isNextSoon = nextSession && (isToday(nextSession.scheduledAt) || isTomorrow(nextSession.scheduledAt));

  const greetingName = firstName(user?.fullName);
  const hoursLearned = Math.round(sessions.reduce((t, s) => t + (s.durationMinutes ?? 60) / 60, 0));
  const activeTutors = new Set(sessions.map((s) => s.tutor?.id)).size;
  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;

  // Recent activity from sessions
  const recentActivity = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        icon: s.status === 'COMPLETED' ? CheckCircle2 : s.status === 'ACCEPTED' ? Calendar : Clock,
        color: s.status === 'COMPLETED' ? '#D4FF24' : s.status === 'ACCEPTED' ? '#1558C9' : 'rgba(255,255,255,0.4)',
        text: s.status === 'COMPLETED'
          ? `Completed ${s.subject} with ${s.tutor?.fullName}`
          : s.status === 'ACCEPTED'
          ? `${s.subject} session confirmed with ${s.tutor?.fullName}`
          : `${s.subject} session requested`,
        time: new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      }));
  }, [sessions]);

  return (
    <AppShell title="Dashboard">
      {/* Hero banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #1558C9 0%, #0d3d8a 55%, #030407 100%)' }}>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(212,255,36,0.07)' }} />
        <div className="absolute -bottom-12 right-32 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#D4FF24' }}>{timeGreeting()}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome back, {greetingName} 👋
            </h2>
            <p className="mt-2 text-white/60 max-w-md">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming session${upcoming.length !== 1 ? 's' : ''}. Keep the momentum going.`
                : 'Ready to learn? Find a tutor and book your next session.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/tutors" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
              <Search className="h-4 w-4" /> Find a tutor
            </Link>
            {walletState.data && (
              <Link to="/wallet" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10" style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}>
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
              {isToday(nextSession.scheduledAt) ? '🔥 Today' : '⏰ Tomorrow'}
            </p>
            <p className="font-bold text-white truncate">
              {nextSession.subject} with {nextSession.tutor?.fullName}
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
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, accent: '#1558C9', sub: upcoming.length > 0 ? `Next: ${timeUntil(upcoming[0].scheduledAt)}` : 'None scheduled' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, accent: '#D4FF24', sub: completedCount > 0 ? '↑ Keep it up!' : 'Book your first' },
          { label: 'Hours learned', value: hoursLearned, icon: Clock, accent: '#1558C9', sub: `${hoursLearned >= 5 ? '🔥 Great progress' : 'Goal: 5 hrs/week'}` },
          { label: 'Tutors worked with', value: activeTutors, icon: Star, accent: '#D4FF24', sub: activeTutors > 0 ? 'Across subjects' : 'Find your first' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 transition hover:scale-[1.02] hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${stat.accent}12 0%, rgba(21,88,201,0.06) 100%)`, border: `1px solid ${stat.accent}30` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-white/50">{stat.label}</p>
                <p className="mt-1.5 text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-white/40">{stat.sub}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${stat.accent}22`, boxShadow: `0 0 16px ${stat.accent}30` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming sessions — richer rows */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upcoming sessions</h3>
              <Link to="/sessions" className="text-sm font-bold transition hover:opacity-80" style={{ color: '#D4FF24' }}>View all →</Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={cardStyle}>
                <Calendar className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 font-semibold text-white">No upcoming sessions</p>
                <p className="mt-1 text-sm text-white/50">Book a tutor to get started</p>
                <Link to="/tutors" className="mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
                  Find a tutor <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((session) => (
                  <Link key={session.id} to={`/sessions/${session.id}`} className="flex items-center gap-4 rounded-2xl p-4 transition hover:scale-[1.01]" style={cardStyle}>
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
                      {session.tutor?.fullName?.charAt(0) ?? 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{session.tutor?.fullName}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.3)', color: 'rgba(255,255,255,0.7)' }}>
                          {session.subject}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: '#D4FF24' }}>
                        {timeUntil(session.scheduledAt)}
                      </p>
                    </div>
                  </Link>
                ))}
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
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Quick actions</h3>
          <div className="space-y-3">
            {/* Primary CTA — contextual */}
            {upcoming.length === 0 ? (
              <Link to="/tutors" className="flex items-center gap-4 rounded-2xl p-5 transition hover:opacity-90" style={{ background: '#D4FF24' }}>
                <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: '#030407' }} />
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#030407' }}>Book your first session</p>
                  <p className="text-xs" style={{ color: 'rgba(3,4,7,0.55)' }}>Find a tutor now</p>
                </div>
                <ArrowRight className="h-4 w-4" style={{ color: '#030407' }} />
              </Link>
            ) : (
              <Link to="/tutors" className="flex items-center gap-4 rounded-2xl p-5 transition hover:opacity-90" style={{ background: '#D4FF24' }}>
                <Search className="h-5 w-5 flex-shrink-0" style={{ color: '#030407' }} />
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#030407' }}>Find another tutor</p>
                  <p className="text-xs" style={{ color: 'rgba(3,4,7,0.55)' }}>Browse course units</p>
                </div>
                <ArrowRight className="h-4 w-4" style={{ color: '#030407' }} />
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
                  <Icon className="h-5 w-5" style={{ color: highlight ? '#ff8080' : '#1558C9' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs truncate" style={{ color: highlight ? '#ff8080' : 'rgba(255,255,255,0.4)' }}>{sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/25" />
              </Link>
            ))}
          </div>

          {/* Weekly goal */}
          <div className="mt-4 rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold" style={{ color: '#D4FF24' }}>Weekly goal</p>
              <p className="text-xs text-white/40">{Math.min(hoursLearned, 5)}/5 hrs</p>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((hoursLearned / 5) * 100, 100)}%`, background: '#D4FF24' }} />
            </div>
            <p className="mt-2 text-xs text-white/40">
              {hoursLearned >= 5 ? '🎉 Goal reached this week!' : `${5 - Math.min(hoursLearned, 5)} more hours to hit your goal`}
            </p>
          </div>

          <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.2)' }}>
            <p className="text-xs font-bold text-white/60">Payments secured</p>
            <p className="mt-1 text-xs text-white/35">MTN MoMo & Airtel Money. Money held by TutorUG until session is complete.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
