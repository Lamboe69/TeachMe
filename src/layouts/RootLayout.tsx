import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HashScroll } from '@/hooks/HashScroll';

/**
 * Pages that render their own full-height shell (sidebar + top bar), so the
 * global header/footer must not be shown — otherwise the fixed sidebar
 * overlaps them on desktop.
 */
const APP_SHELL_PATHS = new Set([
  '/tutors',
  '/student/dashboard',
  '/student/profile',
  '/tutor/dashboard',
  '/tutor/availability',
  '/sessions',
  '/wallet',
]);

function usesAppShell(pathname: string) {
  return (
    APP_SHELL_PATHS.has(pathname) ||
    pathname.startsWith('/tutor/profile') ||
    pathname.startsWith('/tutors/')
  );
}

/** Shell used by every page: header, content, footer. */
export function RootLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const showChrome = !isLanding && !usesAppShell(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      {showChrome && <Header />}
      <main id="main-content" className="flex-1">
        <HashScroll />
        <Outlet />
      </main>
      {showChrome && <Footer />}
      <ScrollRestoration />
    </div>
  );
}
