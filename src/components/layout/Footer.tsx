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
      { label: 'Pricing & fees', to: '/#pricing' },
      { label: 'FAQ', to: '/#faq' },
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
    <footer className="mt-auto border-t border-[rgba(21,88,201,0.25)] bg-[#030407]">
      <div className="container-page py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
              Tutor UG is Uganda&apos;s peer-to-peer tutoring marketplace. University students help
              each other succeed — at transparent prices in shillings, protected by escrow.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-white">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/55 transition hover:text-[#D4FF24]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-bold text-white">Account</h2>
            <ul className="mt-3 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/55 transition hover:text-[#D4FF24]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[rgba(21,88,201,0.2)] pt-6 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>© {CURRENT_YEAR} TutorUG. Built for Ugandan university students.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/terms" className="transition hover:text-white">Terms</Link>
            <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
            <Link to="/refund-policy" className="transition hover:text-white">Refunds</Link>
            <Link to="/contact" className="transition hover:text-white">Help &amp; support</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
