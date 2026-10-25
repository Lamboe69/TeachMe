import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Home, Search, Calendar, User, Mail, Phone, FileText, Save, Bell, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/format';

export function StudentProfilePageNew() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
            <Link to="/student/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/tutors" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Calendar className="h-5 w-5" />
              My sessions
            </Link>
            <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Wallet className="h-5 w-5" />
              Wallet
            </Link>
            <Link to="/student/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold">
              <User className="h-5 w-5" />
              Profile
            </Link>
          </nav>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-ink-950">Account</h1>
              <div className="flex items-center gap-3">
                <button className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-green-50">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-ink-900">{user?.fullName}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">My profile</h2>
              <p className="mt-2 text-lg text-ink-700">Keep your contact details up to date</p>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-green-200 text-center">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-3xl font-bold text-white">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-ink-950">{user?.fullName}</h3>
                  <p className="mt-1 text-ink-600">{user?.email}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5">
                    <span className="text-sm font-semibold text-green-700">Student</span>
                  </div>
                  <p className="mt-4 text-sm text-ink-600">Member since {formatDate(user?.createdAt)}</p>
                </div>

                <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 ring-1 ring-amber-200">
                  <p className="font-bold text-amber-900">Privacy note</p>
                  <p className="mt-2 text-sm text-amber-800">Tutors see your name and booking message. Your email is never shown to other learners.</p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-2xl bg-white shadow-lg ring-1 ring-green-200">
                  <div className="border-b border-green-100 px-6 py-5">
                    <h3 className="text-lg font-bold text-ink-950">Edit your details</h3>
                    <p className="mt-1 text-sm text-ink-600">Update your personal information</p>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <User className="h-4 w-4" />
                        Full name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <Mail className="h-4 w-4" />
                        Email address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="h-12 w-full rounded-xl border border-ink-300 bg-ink-50 px-4 text-ink-600"
                      />
                      <p className="mt-1 text-xs text-ink-500">Your email address cannot be changed</p>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <Phone className="h-4 w-4" />
                        Phone number (optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+256 7XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <FileText className="h-4 w-4" />
                        Short bio (optional)
                      </label>
                      <textarea
                        placeholder="Tell tutors which subjects and course units you're studying"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full rounded-xl border border-ink-300 px-4 py-3 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-green-100 pt-6">
                      {saved && (
                        <p className="text-sm font-semibold text-green-700">✓ Profile updated successfully</p>
                      )}
                      <button
                        type="submit"
                        className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
                      >
                        <Save className="h-4 w-4" />
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
