import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Clock,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Search,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

interface AppShellProps {
  children: React.ReactNode;
  /** Page title shown in the top bar. */
  title: string;
  /** Which nav item should be highlighted as active. */
  activeNav?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTutor = user?.role === 'TUTOR';

  const navItems: NavItem[] = isTutor
    ? [
        { to: '/tutor/dashboard', label: 'Dashboard', icon: Home },
        { to: '/tutors', label: 'Find tutors', icon: Search },
        { to: '/sessions', label: 'Sessions', icon: Calendar },
        { to: '/wallet', label: 'Wallet', icon: Wallet },
        { to: '/tutor/profile/edit', label: 'My profile', icon: User },
        { to: '/tutor/availability', label: 'Availability', icon: Clock },
      ]
    : [
        { to: '/student/dashboard', label: 'Dashboard', icon: Home },
        { to: '/tutors', label: 'Find tutors', icon: Search },
        { to: '/sessions', label: 'My sessions', icon: Calendar },
        { to: '/wallet', label: 'Wallet', icon: Wallet },
        { to: '/student/profile', label: 'Profile', icon: User },
      ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been signed out.');
      navigate('/');
    } catch {
      toast.error('Could not sign you out. Please try again.');
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center px-6 border-b border-green-100">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-extrabold text-ink-950">TutorUG</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Sidebar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition',
                isActive
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                  : 'text-ink-700 hover:bg-green-50 hover:text-green-700',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-green-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-ink-600 hover:bg-red-50 hover:text-red-700 transition text-sm font-medium"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-green-100 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="lg:pl-72 w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-green-100">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                type="button"
                className="lg:hidden grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-green-50"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-ink-950">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-green-50"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                  {user?.fullName?.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-ink-900">
                  {user?.fullName}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

/** Close button shown inside the mobile drawer. */
export function MobileMenuClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
      aria-label="Close menu"
    >
      <X className="h-5 w-5" />
    </button>
  );
}
