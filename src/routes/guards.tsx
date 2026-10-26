import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

/**
 * Blocks a route until we know who is signed in.
 *
 * The frontend guard is a convenience only — the backend is the authority
 * and enforces access on every request.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="container-page">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <>{children}</>;
}

/** Blocks a route for accounts that do not have the required role. */
export function RequireRole({
  role,
  children,
}: {
  role: UserRole | UserRole[];
  children: ReactNode;
}) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="container-page">
        <LoadingState label="Checking your access…" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/** Sends already-signed-in users away from the login / register pages. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="container-page">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
}
