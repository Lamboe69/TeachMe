import { lazy } from 'react';

/**
 * Every page is loaded on demand.
 *
 * Learners often browse on a slow mobile connection, so the initial download
 * only contains the shell and the page the visitor actually asked for.
 */
export const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);
export const RegisterPage = lazy(() =>
  import('@/pages/RegisterPageNew').then((m) => ({ default: m.RegisterPageNew })),
);
export const LoginPage = lazy(() =>
  import('@/pages/LoginPageNew').then((m) => ({ default: m.LoginPageNew })),
);
export const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
export const StudentDashboardPage = lazy(() =>
  import('@/pages/StudentDashboardNew').then((m) => ({ default: m.StudentDashboardNew })),
);
export const StudentProfilePage = lazy(() =>
  import('@/pages/StudentProfilePageNew').then((m) => ({ default: m.StudentProfilePageNew })),
);
export const TutorsPage = lazy(() =>
  import('@/pages/TutorsPageNew').then((m) => ({ default: m.TutorsPageNew })),
);
export const TutorProfilePage = lazy(() =>
  import('@/pages/TutorProfilePageNew').then((m) => ({ default: m.TutorProfilePageNew })),
);
export const BookSessionPage = lazy(() =>
  import('@/pages/BookSessionPage').then((m) => ({ default: m.BookSessionPage })),
);
export const SessionsPage = lazy(() =>
  import('@/pages/SessionsPageNew').then((m) => ({ default: m.SessionsPageNew })),
);
export const SessionDetailPage = lazy(() =>
  import('@/pages/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
);
export const FeedbackPage = lazy(() =>
  import('@/pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })),
);
export const TutorDashboardPage = lazy(() =>
  import('@/pages/TutorDashboardNew').then((m) => ({ default: m.TutorDashboardNew })),
);
export const TutorSessionsPage = lazy(() =>
  import('@/pages/TutorSessionsPage').then((m) => ({ default: m.TutorSessionsPage })),
);
export const TutorProfileEditPage = lazy(() =>
  import('@/pages/TutorProfileEditPage').then((m) => ({ default: m.TutorProfileEditPage })),
);
export const TutorAvailabilityPage = lazy(() =>
  import('@/pages/TutorAvailabilityPage').then((m) => ({ default: m.TutorAvailabilityPage })),
);

export const WalletPage = lazy(() =>
  import('@/pages/WalletPage').then((m) => ({ default: m.WalletPage })),
);

export const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
);
export const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

