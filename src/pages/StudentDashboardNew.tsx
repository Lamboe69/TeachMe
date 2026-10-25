import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, GraduationCap, Home, Search, Star, User, Wallet, ArrowRight, BookOpen, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { firstName } from '@/utils/format';
import { isUpcoming } from '@/utils/sessionPermissions';

export function StudentDashboardNew() {
  const { user } = useAuth();
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo(() => sessionsState.data ?? [], [sessionsState.data]);

  const upcoming = useMemo(
    () => sessions.filter(isUpcoming).sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [sessions],
  );

  const greetingName = firstName(user?.fullName);

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-green-100">
          <div className="flex h-20 items-center px-6 border-b border-green-100">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-ink-950">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link to="/student/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Calendar className="h-5 w-5" />
              My sessions
            </Link>
            <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Wallet className="h-5 w-5" />
              Wallet
            </Link>
            <Link to="/student/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <User className="h-5 w-5" />
              Profile
            </Link>
          </nav>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <h1 className="text-lg font-bold text-ink-950">Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-green-50">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                    {greetingName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-ink-900">{user?.fullName}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
                Welcome back, {greetingName} 👋
              </h2>
              <p className="mt-2 text-lg text-ink-700">Continue your learning journey with your study partners</p>
            </div>

            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Upcoming sessions", value: upcoming.length, icon: Calendar, color: "green" },
                { label: "Total sessions", value: sessions.length, icon: BookOpen, color: "amber" },
                { label: "Hours learned", value: Math.round(sessions.reduce((t: number, s: any) => t + (s.durationMinutes || 60) / 60, 0)), icon: Clock, color: "green" },
                { label: "Active tutors", value: new Set(sessions.map((s: any) => s.tutor?.id)).size, icon: Star, color: "amber" },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ink-600">{stat.label}</p>
                      <p className="mt-2 text-3xl font-black text-ink-950">{stat.value}</p>
                    </div>
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${stat.color === 'green' ? 'bg-green-100' : 'bg-amber-100'}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color === 'green' ? 'text-green-700' : 'text-amber-700'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-ink-950">Upcoming sessions</h3>
                  <Link to="/sessions" className="text-sm font-semibold text-green-700 hover:underline">View all</Link>
                </div>
                {upcoming.length === 0 ? (
                  <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
                    <Calendar className="mx-auto h-12 w-12 text-ink-400" />
                    <p className="mt-4 font-semibold text-ink-900">No upcoming sessions</p>
                    <p className="mt-1 text-sm text-ink-600">Book a tutor to get started</p>
                    <Link to="/tutors" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-bold text-white">
                      Find a tutor
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcoming.slice(0, 3).map((session: any) => (
                      <div key={session.id} className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-lg font-bold text-white">
                          {session.tutor?.fullName?.charAt(0) || 'T'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-ink-950">{session.tutor?.fullName}</p>
                          <p className="text-sm text-ink-600">{session.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink-900">{new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-sm text-ink-600">{new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-ink-950">Quick actions</h3>
                </div>
                <div className="space-y-3">
                  <Link to="/tutors" className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg transition hover:shadow-xl">
                    <Search className="h-6 w-6" />
                    <div className="flex-1">
                      <p className="font-bold">Find a tutor</p>
                      <p className="text-sm text-white/90">Browse course units</p>
                    </div>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/sessions" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl">
                    <Calendar className="h-6 w-6 text-green-700" />
                    <div className="flex-1">
                      <p className="font-bold text-ink-950">My sessions</p>
                      <p className="text-sm text-ink-600">View all sessions</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-ink-400" />
                  </Link>
                  <Link to="/wallet" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl">
                    <Wallet className="h-6 w-6 text-green-700" />
                    <div className="flex-1">
                      <p className="font-bold text-ink-950">My wallet</p>
                      <p className="text-sm text-ink-600">Top up or withdraw</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-ink-400" />
                  </Link>
                  <Link to="/student/profile" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl">
                    <User className="h-6 w-6 text-green-700" />
                    <div className="flex-1">
                      <p className="font-bold text-ink-950">My profile</p>
                      <p className="text-sm text-ink-600">Update details</p>
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
                  <p className="mt-3 text-sm text-amber-900">Money held by TutorUG until session complete</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
