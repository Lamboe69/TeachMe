import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  {
    title: 'Learn',
    links: [
      { label: 'Find a tutor', to: '/tutors' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Subjects', to: '/tutors' },
    ],
  },
];

export function Footer() {
  const { user, status } = useAuth();
  const isAuthenticated = status === 'authenticated' && !!user;

  const accountLinks = isAuthenticated
    ? [
        {
          label: 'Dashboard',
          to: user?.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard',
        },
        { label: 'My sessions', to: '/sessions' },
        { label: 'My profile', to: user?.role === 'TUTOR' ? '/tutor/dashboard' : '/student/profile' },
      ]
    : [
        { label: 'Create account', to: '/register' },
        { label: 'Log in', to: '/login' },
      ];

  return (
    <footer className="mt-auto border-t border-ink-200 bg-white">
      <div className="container-page py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
              Tutor UG connects Ugandan learners with vetted tutors for one-to-one lessons in
              Mathematics, Sciences, English, ICT and more — at transparent prices in shillings.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-ink-900">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-500 transition hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold text-ink-900">Account</h2>
            <ul className="mt-3 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-500 transition hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>© {CURRENT_YEAR} TutorUG. Built for Ugandan university students.</p>
        </div>
      </div>
    </footer>
  );
}
