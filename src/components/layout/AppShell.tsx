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
import type { User as AuthUser } from '@/types';

interface NavItem { to: string; label: string; icon: typeof Home; badge?: number; }
interface AppShellProps { children: React.ReactNode; title: string; activeNav?: string; }

function sidebarInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function SidebarContent({ user, isTutor, navItems, onLogout, onClose }: { user: AuthUser | null; isTutor: boolean; navItems: NavItem[]; onLogout: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #080c18 0%, #030407 100%)' }}>
      {/* Logo */}
      <div className="flex h-20 items-center px-6" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="grid h-10 w-10 place-items-center rounded-xl shadow-lg" style={{ background: '#D4FF24', boxShadow: '0 0 20px rgba(212,255,36,0.3)' }}>
            <GraduationCap className="h-6 w-6" style={{ color: '#030407' }} />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">TutorUG</span>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(21,88,201,0.2) 0%, rgba(21,88,201,0.08) 100%)', border: '1px solid rgba(21,88,201,0.35)' }}>
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-black" style={{ background: 'linear-gradient(135deg, #1558C9, #0d3d8a)', color: '#D4FF24', boxShadow: '0 0 16px rgba(21,88,201,0.5)' }}>
            {sidebarInitials(user?.fullName)}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" style={{ background: '#D4FF24', border: '2px solid #030407' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
            <p className="text-xs font-semibold" style={{ color: '#D4FF24' }}>{isTutor ? '⚡ Tutor' : '📚 Student'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" aria-label="Sidebar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => cn(
              'group flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-150 text-sm',
              isActive ? 'font-bold text-white' : 'text-white/50 hover:text-white/90',
            )}
            style={({ isActive }) => isActive
              ? { background: 'rgba(21,88,201,0.25)', boxShadow: 'inset 3px 0 0 #D4FF24', paddingLeft: '13px' }
              : { paddingLeft: '16px' }
            }
          >
            {({ isActive }) => (
              <>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-150" style={isActive ? { background: 'rgba(21,88,201,0.4)' } : { background: 'transparent' }}>
                  <item.icon className="h-4 w-4" style={isActive ? { color: '#D4FF24' } : {}} />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#D4FF24', color: '#030407' }}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(21,88,201,0.15)' }}>
        <button onClick={onLogout} className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 transition-all duration-150 hover:text-white hover:bg-white/5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg">
            <LogOut className="h-4 w-4" />
          </div>
          Log out
        </button>
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen" style={{ background: '#0a0c12' }}>
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30" style={{ borderRight: '1px solid rgba(21,88,201,0.25)', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}>
        <SidebarContent user={user} isTutor={isTutor} navItems={navItems} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col shadow-2xl">
            <SidebarContent user={user} isTutor={isTutor} navItems={navItems} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
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
        <main className="animate-rise px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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
