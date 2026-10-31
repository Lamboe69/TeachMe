import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ErrorFallback } from '@/components/ErrorBoundary';
import { PublicOnly, RequireAuth, RequireRole } from './guards';
import {
  BookSessionPage,
  FeedbackPage,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  SessionDetailPage,
  SessionsPage,
  StudentDashboardPage,
  StudentProfilePage,
  TutorAvailabilityPage,
  TutorDashboardPage,
  TutorProfileEditPage,
  TutorProfilePage,
  TutorSessionsPage,
  TutorsPage,
  UnauthorizedPage,
  WalletPage,
} from './lazy-pages';

/**
 * Application routes.
 *
 * Route guards are a UX convenience only — the Spring Boot API is the
 * authority on who may access which resource.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorFallback />,
    children: [
      /* ----------------------------------------------- Public pages */
      { path: '/', element: <LandingPage /> },
      { path: '/tutors', element: <TutorsPage /> },
      { path: '/tutors/:id', element: <TutorProfilePage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },

      /* ----------------------------------------- Student-only pages */
      {
        path: '/student/dashboard',
        element: (
          <RequireAuth>
            <RequireRole role="STUDENT">
              <StudentDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: '/student/profile',
        element: (
          <RequireAuth>
            <RequireRole role="STUDENT">
              <StudentProfilePage />
            </RequireRole>
          </RequireAuth>
        ),
      },

      /* ------------------------------------------- Tutor-only pages */
      {
        path: '/tutor/dashboard',
        element: (
          <RequireAuth>
            <RequireRole role="TUTOR">
              <TutorDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: '/tutor/profile/edit',
        element: (
          <RequireAuth>
            <RequireRole role="TUTOR">
              <TutorProfileEditPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: '/tutor/availability',
        element: (
          <RequireAuth>
            <RequireRole role="TUTOR">
              <TutorAvailabilityPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: '/tutor/sessions',
        element: (
          <RequireAuth>
            <RequireRole role="TUTOR">
              <TutorSessionsPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      /* ------------------------------------------------------- Wallet */
      {
        path: '/wallet',
        element: (
          <RequireAuth>
            <WalletPage />
          </RequireAuth>
        ),
      },

      /* --------------------------------------------- Shared sessions */
      {
        path: '/sessions',
        element: (
          <RequireAuth>
            <SessionsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/sessions/:id',
        element: (
          <RequireAuth>
            <SessionDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: '/sessions/book/:tutorId',
        element: (
          <RequireAuth>
            <RequireRole role={['STUDENT', 'TUTOR']}>
              <BookSessionPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: '/sessions/:id/feedback',
        element: (
          <RequireAuth>
            <RequireRole role="STUDENT">
              <FeedbackPage />
            </RequireRole>
          </RequireAuth>
        ),
      },

      /* ------------------------------------------------------ 404 */
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  /* ----------------------------------------------- Auth screens */
  {
    errorElement: <ErrorFallback />,
    path: '/login',
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    errorElement: <ErrorFallback />,
    path: '/register',
    element: (
      <PublicOnly>
        <RegisterPage />
      </PublicOnly>
    ),
  },
  {
    errorElement: <ErrorFallback />,
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
]);
