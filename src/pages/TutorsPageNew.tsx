import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, ArrowRight, GraduationCap, Home, Calendar, User, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const tutors = [
  { id: 1, name: "Sarah Namutebi", initials: "SN", rating: 4.9, reviews: 204, location: "Makerere University", subjects: ["Calculus", "Database Systems", "Statistics"], bio: "Computer Science student helping you master technical course units with practical examples.", rate: 35000, sessions: 388 },
  { id: 2, name: "Brian Odong", initials: "BO", rating: 4.8, reviews: 126, location: "Kyambogo University", subjects: ["Mathematics", "ICT", "Programming"], bio: "Passionate about breaking down complex concepts into simple, understandable bits.", rate: 45000, sessions: 214 },
  { id: 3, name: "Grace Nakimera", initials: "GN", rating: 4.9, reviews: 189, location: "UCU", subjects: ["Economics", "Business Statistics", "Accounting"], bio: "Business student with excellent grades helping fellow students excel in commerce units.", rate: 40000, sessions: 276 },
  { id: 4, name: "Isaac Mugisha", initials: "IM", rating: 4.7, reviews: 142, location: "MUST", subjects: ["Physics", "Engineering Math", "Mechanics"], bio: "Engineering student making Physics and Math click through hands-on problem solving.", rate: 50000, sessions: 198 },
];

export function TutorsPageNew() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const subjects = ['All', 'Mathematics', 'Physics', 'Computer Science', 'Economics', 'Business', 'Engineering'];

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = subjectFilter === 'All' || tutor.subjects.some(s => s.includes(subjectFilter));
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-green-100">
          <div className="flex h-20 items-center px-6 border-b border-green-100">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-ink-950">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link to={isStudent ? "/student/dashboard" : "/tutor/dashboard"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            {user && (
              <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
                <Wallet className="h-5 w-5" />
                Wallet
              </Link>
            )}
            {user && (
              <Link to={isStudent ? "/student/profile" : "/tutor/profile/edit"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
                <User className="h-5 w-5" />
                Profile
              </Link>
            )}
          </nav>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-ink-950">Find a tutor</h1>
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-ink-900 hidden sm:inline">{user.fullName}</span>
                  </div>
                ) : (
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-ink-700">Log in</Link>
                )}
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
                Find your{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">perfect tutor</span>
              </h2>
              <p className="mt-2 text-lg text-ink-700">Browse fellow university students offering tutoring for course units. All payments secured by TutorUG.</p>
            </div>

            <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search by name or course unit"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl border border-ink-300 pl-11 pr-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSubjectFilter(subject)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        subjectFilter === subject
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'border border-ink-300 text-ink-700 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-ink-700">{filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} found</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="group rounded-2xl bg-white shadow-lg ring-1 ring-green-200 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-xl font-bold text-white">
                        {tutor.initials}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-ink-950">{tutor.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-ink-900">{tutor.rating}</span>
                          </div>
                          <span className="text-sm text-ink-600">({tutor.reviews} reviews)</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {tutor.location}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {tutor.subjects.map((subject) => (
                        <span key={subject} className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                          {subject}
                        </span>
                      ))}
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-ink-700">{tutor.bio}</p>

                    <div className="mb-4 flex items-center justify-between border-t border-green-100 pt-4">
                      <div>
                        <p className="text-xl font-black text-ink-950">UGX {tutor.rate.toLocaleString()}</p>
                        <p className="text-xs text-ink-600">per session</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900">{tutor.sessions} sessions</p>
                        <p className="text-xs text-ink-600">completed</p>
                      </div>
                    </div>

                    <Link to={`/tutors/${tutor.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-bold text-white transition hover:shadow-lg">
                      View profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
