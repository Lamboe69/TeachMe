import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, Clock, GraduationCap, Home,
  LogOut, Menu, Search, User, Wallet, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { cn } from '@/utils/cn';

interface NavItem { to: string; label: string; icon: typeof Home; badge?: number; }
interface AppShellProps { children: React.ReactNode; title: string; activeNav?: string; }

export function AppShell({ children, title }: AppShellProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTutor = user?.role === 'TUTOR';

  // Live badge counts
  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = sessionsState.data ?? [];
  const pendingCount = isTutor ? sessions.filter((s) => s.status === 'REQUESTED').length : 0;
  const upcomingCount = !isTutor ? sessions.filter((s) => s.status === 'ACCEPTED').length : 0;

  const navItems: NavItem[] = isTutor
    ? [
        { to: '/tutor/dashboard', label: 'Dashboard', icon: Home },
        { to: '/tutors', label: 'Find tutors', icon: Search },
        { to: '/sessions', label: 'Sessions', icon: Calendar, badge: pendingCount },
        { to: '/wallet', label: 'Wallet', icon: Wallet },
        { to: '/tutor/profile/edit', label: 'My profile', icon: User },
        { to: '/tutor/availability', label: 'Availability', icon: Clock },
      ]
    : [
        { to: '/student/dashboard', label: 'Dashboard', icon: Home },
        { to: '/tutors', label: 'Find tutors', icon: Search },
        { to: '/sessions', label: 'My sessions', icon: Calendar, badge: upcomingCount },
        { to: '/wallet', label: 'Wallet', icon: Wallet },
        { to: '/student/profile', label: 'Profile', icon: User },
      ];

  const handleLogout = async () => {
    try { await logout(); toast.success('You have been signed out.'); navigate('/'); }
    catch { toast.error('Could not sign you out. Please try again.'); }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: '#030407' }}>
      {/* Logo */}
      <div className="flex h-20 items-center px-6" style={{ borderBottom: '1px solid rgba(21,88,201,0.25)' }}>
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="grid h-10 w-10 place-items-center rounded-xl shadow-lg" style={{ background: '#D4FF24' }}>
            <GraduationCap className="h-6 w-6" style={{ color: '#030407' }} />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">TutorUG</span>
        </Link>
      </div>

      {/* User pill */}
      <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(21,88,201,0.15)', border: '1px solid rgba(21,88,201,0.3)' }}>
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
          {user?.fullName?.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
          <p className="text-xs" style={{ color: '#D4FF24' }}>{isTutor ? 'Tutor' : 'Student'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1" aria-label="Sidebar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm',
              isActive ? 'font-bold' : 'text-white/55 hover:text-white',
            )}
            style={({ isActive }) => isActive
              ? { background: 'rgba(21,88,201,0.3)', borderLeft: '3px solid #D4FF24', paddingLeft: '13px', color: 'white' }
              : { borderLeft: '3px solid transparent', paddingLeft: '13px' }
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#D4FF24', color: '#030407' }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 transition hover:text-white hover:bg-white/5">
          <LogOut className="h-5 w-5 shrink-0" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0a0c12' }}>
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30" style={{ borderRight: '1px solid rgba(21,88,201,0.2)' }}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col shadow-2xl">
            <SidebarContent />
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-72 w-full">
        <header className="sticky top-0 z-30 backdrop-blur-xl" style={{ background: 'rgba(10,12,18,0.95)', borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" className="lg:hidden grid h-10 w-10 place-items-center rounded-xl text-white/60 hover:text-white transition" style={{ border: '1px solid rgba(21,88,201,0.3)' }} onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="relative grid h-10 w-10 place-items-center rounded-xl text-white/50 transition hover:text-white" style={{ border: '1px solid rgba(21,88,201,0.3)' }} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {(pendingCount + upcomingCount) > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-black" style={{ background: '#D4FF24', color: '#030407' }}>
                    {pendingCount + upcomingCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(21,88,201,0.15)', border: '1px solid rgba(21,88,201,0.3)' }}>
                <div className="grid h-8 w-8 place-items-center rounded-full text-sm font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
                  {user?.fullName?.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-white">{user?.fullName}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function MobileMenuClose({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:text-white" aria-label="Close menu">
      <X className="h-5 w-5" />
    </button>
  );
}
