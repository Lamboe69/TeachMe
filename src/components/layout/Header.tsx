import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserCircle,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface NavItem {
  to: string;
  label: string;
  icon?: typeof Search;
}

export function Header() {
  const { user, status, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the open menus whenever the route changes (adjust state during
  // render — avoids an extra cascading render from an effect).
  const [lastPathname, setLastPathname] = useState(location.pathname);
  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    setMobileOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isAuthenticated = status === 'authenticated' && !!user;
  const isTutor = user?.role === 'TUTOR';

  const navItems: NavItem[] = isAuthenticated
    ? isTutor
      ? [
          { to: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/tutor/sessions', label: 'Sessions', icon: CalendarDays },
          { to: '/wallet', label: 'Wallet', icon: Wallet },
          { to: '/tutors', label: 'Find tutors', icon: Search },
        ]
      : [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/sessions', label: 'My sessions', icon: CalendarDays },
          { to: '/wallet', label: 'Wallet', icon: Wallet },
          { to: '/tutors', label: 'Find tutors', icon: Search },
        ]
    : [
        { to: '/tutors', label: 'Find tutors', icon: Search },
        { to: '/#how-it-works', label: 'How it works', icon: LayoutDashboard },
      ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been signed out.');
      navigate('/');
    } catch {
      toast.error('We could not sign you out. Please try again.');
    }
  };

  const dashboardPath = isTutor ? '/tutor/dashboard' : '/student/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-green-50 text-green-800'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-xl border border-ink-200 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-700 text-xs font-bold text-white">
                  {getInitials(user?.fullName)}
                </span>
                <span className="max-w-[9rem] truncate">{user?.fullName}</span>
                <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg"
                >
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink-900">{user?.fullName}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                    <p className="mt-1 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-green-700">
                      {user?.role === 'TUTOR' ? 'Tutor' : 'Student'}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    to={dashboardPath}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-50"
                  >
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                  <Link
                    role="menuitem"
                    to={isTutor ? '/tutor/sessions' : '/sessions'}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-50"
                  >
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Sessions
                  </Link>
                  <Link
                    role="menuitem"
                    to="/wallet"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-50"
                  >
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                    Wallet
                  </Link>
                  {!isTutor ? (
                    <Link
                      role="menuitem"
                      to="/student/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-50"
                    >
                      <UserCircle className="h-4 w-4" aria-hidden="true" />
                      My profile
                    </Link>
                  ) : null}
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink to="/register" variant="primary" size="sm">
                Create account
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-700 transition hover:bg-ink-100 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-navigation" className="border-t border-ink-200 bg-white md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition',
                    isActive
                      ? 'bg-green-50 text-green-800'
                      : 'text-ink-700 hover:bg-ink-100',
                  )
                }
              >
                {item.icon ? <item.icon className="h-5 w-5" aria-hidden="true" /> : null}
                {item.label}
              </NavLink>
            ))}

            <div className="my-2 h-px bg-ink-200" />

            {isAuthenticated ? (
              <>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Signed in as {user?.fullName}
                </p>
                {!isTutor ? (
                  <NavLink
                    to="/student/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-ink-700 transition hover:bg-ink-100"
                  >
                    <UserCircle className="h-5 w-5" aria-hidden="true" />
                    My profile
                  </NavLink>
                ) : null}
                <Button variant="outline" fullWidth leftIcon={LogOut} onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <ButtonLink to="/login" variant="outline" fullWidth>
                  Log in
                </ButtonLink>
                <ButtonLink to="/register" variant="primary" fullWidth>
                  Create account
                </ButtonLink>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
