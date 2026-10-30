import { useState } from 'react';
import { FileText, Mail, Phone, Save, User } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { formatDate } from '@/utils/format';

const inputClass = 'h-12 w-full rounded-xl px-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' };
const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };

export function StudentProfilePageNew() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <p className="mt-2 text-white/55">Keep your contact details up to date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — avatar card */}
        <div className="space-y-5">
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full text-3xl font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
              {user?.fullName?.charAt(0)}
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{user?.fullName}</h3>
            <p className="mt-1 text-sm text-white/50">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(212,255,36,0.12)', border: '1px solid rgba(212,255,36,0.25)' }}>
              <span className="text-sm font-bold" style={{ color: '#D4FF24' }}>Student</span>
            </div>
            <p className="mt-4 text-xs text-white/35">Member since {formatDate(user?.createdAt)}</p>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
            <p className="font-bold text-sm" style={{ color: '#D4FF24' }}>Privacy note</p>
            <p className="mt-2 text-xs text-white/50">
              Tutors see your name and booking message. Your email is never shown to other learners.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
              <h3 className="text-lg font-bold text-white">Edit your details</h3>
              <p className="mt-1 text-sm text-white/50">Update your personal information</p>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <User className="h-4 w-4" /> Full name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Mail className="h-4 w-4" /> Email address
                </label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="h-12 w-full rounded-xl px-4 text-sm text-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <p className="mt-1 text-xs text-white/30">Your email address cannot be changed</p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Phone className="h-4 w-4" /> Phone number (optional)
                </label>
                <input
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <FileText className="h-4 w-4" /> Short bio (optional)
                </label>
                <textarea
                  placeholder="Tell tutors which subjects and course units you're studying"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
                  style={inputStyle}
                />
              </div>

              <div className="flex justify-end pt-4" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
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
