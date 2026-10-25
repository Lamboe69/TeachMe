import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, GraduationCap, Home, Search, User, Plus, Bell, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';

export function SessionsPageNew() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [activeTab, setActiveTab] = useState('ALL');
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo(() => sessionsState.data ?? [], [sessionsState.data]);

  const tabs = [
    { id: 'ALL', label: 'All', count: sessions.length },
    { id: 'REQUESTED', label: 'Requested', count: sessions.filter((s: any) => s.status === 'REQUESTED').length },
    { id: 'ACCEPTED', label: 'Accepted', count: sessions.filter((s: any) => s.status === 'ACCEPTED').length },
    { id: 'COMPLETED', label: 'Completed', count: sessions.filter((s: any) => s.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: sessions.filter((s: any) => s.status === 'CANCELLED').length },
    { id: 'REJECTED', label: 'Rejected', count: sessions.filter((s: any) => s.status === 'REJECTED').length },
  ];

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return sessions;
    return sessions.filter((s: any) => s.status === activeTab);
  }, [sessions, activeTab]);

  const sorted = useMemo(
    () => [...filtered].sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [filtered],
  );

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
            <Link to={isStudent ? "/student/dashboard" : "/tutor/dashboard"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold">
              <Calendar className="h-5 w-5" />
              My sessions
            </Link>
            {user && (
              <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
                <Wallet className="h-5 w-5" />
                Wallet
              </Link>
            )}
            {user && (
              <Link to={isStudent ? "/student/profile" : "/tutor/profile/edit"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
                <User className="h-5 w-5" />
                Profile
              </Link>
            )}
          </nav>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-ink-950">Sessions</h1>
              <div className="flex items-center gap-3">
                <button className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-green-50">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-ink-900">{user?.fullName}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">My sessions</h2>
                <p className="mt-2 text-lg text-ink-700">Track and manage all your tutoring sessions</p>
              </div>
              {isStudent && (
                <Link to="/tutors" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg">
                  <Plus className="h-5 w-5" />
                  Book a session
                </Link>
              )}
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
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-ink-100'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {sorted.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
                <Calendar className="mx-auto h-16 w-16 text-ink-400" />
                <h3 className="mt-4 text-xl font-bold text-ink-950">No sessions yet</h3>
                <p className="mt-2 text-ink-700">Browse the tutor directory and request your first session</p>
                {isStudent && (
                  <Link to="/tutors" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-bold text-white">
                    Find a tutor
                    <Plus className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sorted.map((session: any) => (
                  <Link
                    key={session.id}
                    to={`/sessions/${session.id}`}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200 transition hover:shadow-xl sm:flex-row sm:items-center"
                  >
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-lg font-bold text-white">
                      {(isStudent ? session.tutor?.fullName : session.student?.fullName)?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-ink-950">
                        {isStudent ? session.tutor?.fullName : session.student?.fullName}
                      </h4>
                      <p className="text-sm text-ink-600">{session.subject}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-ink-700">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-ink-700">
                        <Clock className="h-4 w-4" />
                        {new Date(session.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      session.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      session.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      session.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      session.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {session.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
