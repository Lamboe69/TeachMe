import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { services } from '@/services';
import { setUnauthorizedHandler } from '@/services/api/client';
import { clearAccessToken } from '@/services/api/tokenStore';
import { toAppError } from '@/utils/apiError';
import type { AppError } from '@/utils/apiError';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Error raised while restoring the session on first load. */
  bootstrapError: AppError | null;
  login: (payload: LoginRequest) => Promise<User>;
  register: (payload: RegisterRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [bootstrapError, setBootstrapError] = useState<AppError | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Restore the existing session (cookie session or bearer token).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const current = await services.auth.me();
        if (cancelled) return;
        setUserState(current);
        setStatus('authenticated');
      } catch (error) {
        if (cancelled) return;
        const appError = toAppError(error);
        setUserState(null);
        setStatus('unauthenticated');
        // Only surface a bootstrap error when the server was unreachable.
        setBootstrapError(appError.isNetworkError ? appError : null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A 401 from any request means the session expired: drop local state.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUserState(null);
      setStatus((current) => (current === 'authenticated' ? 'unauthenticated' : current));
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const result = await services.auth.login(payload);
    let current: User | null = null;

    try {
      current = await services.auth.me();
    } catch {
      current = null;
    }

    if (!current) {
      // Fall back to the user embedded in the login response when the backend
      // does not expose /api/auth/me.
      const raw = result.raw as Record<string, unknown>;
      const candidate = (raw['user'] ?? raw['data'] ?? raw) as Record<string, unknown>;
      const id = String(candidate['id'] ?? candidate['userId'] ?? result.userId ?? '');
      const fullName = String(candidate['fullName'] ?? candidate['name'] ?? candidate['email'] ?? '');
      const email = String(candidate['email'] ?? '');
      const role = String(candidate['role'] ?? result.role ?? 'STUDENT');

      if (!id) {
        throw toAppError(
          new Error(
            'Signed in, but the server did not return your account details. Please contact support.',
          ),
        );
      }

      current = {
        id,
        fullName: fullName || email,
        email,
        role: role.toUpperCase() === 'TUTOR' ? 'TUTOR' : 'STUDENT',
        phone: (candidate['phone'] as string) ?? null,
        bio: (candidate['bio'] as string) ?? null,
        avatarUrl: (candidate['avatarUrl'] as string) ?? null,
        createdAt: (candidate['createdAt'] as string) ?? null,
      };
    }

    if (!mounted.current) return current;
    setUserState(current);
    setStatus('authenticated');
    setBootstrapError(null);
    return current;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const result = await services.auth.register(payload);

    // If the backend created a session straight away (token returned),
    // hydrate the user so we can send them straight into the app.
    if (result.token) {
      try {
        const current = await services.auth.me();
        if (mounted.current) {
          setUserState(current);
          setStatus('authenticated');
        }
      } catch {
        // No session was created — the user must log in.
      }
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await services.auth.logout();
    } finally {
      clearAccessToken();
      setUserState(null);
      setStatus('unauthenticated');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const current = await services.auth.me();
      if (!mounted.current) return null;
      setUserState(current);
      setStatus('authenticated');
      return current;
    } catch (error) {
      if (!mounted.current) return null;
      const appError = toAppError(error);
      if (appError.isUnauthorized) {
        setUserState(null);
        setStatus('unauthenticated');
      }
      return null;
    }
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    setStatus('authenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      bootstrapError,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, status, bootstrapError, login, register, logout, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}
