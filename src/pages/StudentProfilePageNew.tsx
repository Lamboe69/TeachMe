import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, FileText, LogOut, Mail, Phone, Save, ShieldCheck, User, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { formatDate } from '@/utils/format';
import type { Session } from '@/types';

const inputClass = 'h-12 w-full rounded-xl px-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' };
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const BIO_LIMIT = 280;

function initials(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function StudentProfilePageNew() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  });

  const sessionsState = useAsyncData(() => services.sessions.listMine(), []);
  const sessions = useMemo<Session[]>(() => sessionsState.data ?? [], [sessionsState.data]);
  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'COMPLETED').length;
    const tutors = new Set(sessions.map((s) => s.tutor?.id).filter(Boolean)).size;
    return { total: sessions.length, completed, tutors };
  }, [sessions]);

  const dirty =
    formData.fullName !== (user?.fullName ?? '') ||
    formData.phone !== (user?.phone ?? '') ||
    formData.bio !== (user?.bio ?? '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const updated = await services.users.updateMe({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || undefined,
        bio: formData.bio.trim() || undefined,
      });
      setUser(updated);
      toast.success('Profile updated', 'Your details have been saved.');
    } catch (error) {
      toast.error('Could not save', toAppError(error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Profile">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: '#D4FF24' }}>Account</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My profile</h2>
        <p className="mt-2 text-white/55">Keep your contact details up to date so tutors can reach you</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — summary */}
        <div className="space-y-5">
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full text-3xl font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
              {initials(user?.fullName)}
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{user?.fullName}</h3>
            <p className="mt-1 text-sm text-white/50">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(212,255,36,0.12)', border: '1px solid rgba(212,255,36,0.25)' }}>
              <span className="text-sm font-bold" style={{ color: '#D4FF24' }}>Student</span>
            </div>
            <p className="mt-4 text-xs text-white/35">Member since {formatDate(user?.createdAt)}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sessions', value: stats.total, icon: BookOpen },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
              { label: 'Tutors', value: stats.tutors, icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 text-center" style={cardStyle}>
                <stat.icon className="mx-auto h-5 w-5" style={{ color: '#D4FF24' }} />
                <p className="mt-2 text-xl font-black text-white">
                  {sessionsState.loading ? '—' : stat.value}
                </p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
            <p className="font-bold text-sm" style={{ color: '#D4FF24' }}>Privacy note</p>
            <p className="mt-2 text-xs text-white/50">
              Tutors see your name and booking message. Your email is never shown to other learners.
            </p>
          </div>

          {/* Security */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/50">
              <ShieldCheck className="h-4 w-4" /> Security
            </p>
            <div className="space-y-2">
              <Link
                to="/forgot-password"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                style={{ border: '1px solid rgba(21,88,201,0.4)' }}
              >
                Change password
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
                style={{ border: '1px solid rgba(255,60,60,0.35)', color: '#ff8080' }}
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
              <div>
                <h3 className="text-lg font-bold text-white">Edit your details</h3>
                <p className="mt-1 text-sm text-white/50">Update your personal information</p>
              </div>
              {dirty && (
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(212,255,36,0.12)', color: '#D4FF24' }}>
                  Unsaved changes
                </span>
              )}
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <User className="h-4 w-4" /> Full name *
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Mail className="h-4 w-4" /> Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="h-12 w-full rounded-xl px-4 text-sm text-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <p className="mt-1 text-xs text-white/30">Your email address cannot be changed</p>
              </div>

              <div>
                <label htmlFor="profile-phone" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Phone className="h-4 w-4" /> Phone number (optional)
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="profile-bio" className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <FileText className="h-4 w-4" /> Short bio (optional)
                  </label>
                  <span className={`text-xs ${formData.bio.length > BIO_LIMIT ? 'text-[#ff8080]' : 'text-white/30'}`}>
                    {formData.bio.length}/{BIO_LIMIT}
                  </span>
                </div>
                <textarea
                  id="profile-bio"
                  placeholder="Tell tutors which subjects and course units you're studying"
                  rows={4}
                  maxLength={BIO_LIMIT}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
                <p className="text-xs text-white/35">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: '#D4FF24', color: '#030407' }}
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
