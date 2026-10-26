import { useState } from 'react';
import { FileText, Mail, Phone, Save, User } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { formatDate } from '@/utils/format';

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
    <AppShell title="Account">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">My profile</h2>
        <p className="mt-2 text-lg text-ink-700">Keep your contact details up to date</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
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

          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 ring-1 ring-amber-200">
            <p className="font-bold text-amber-900">Privacy note</p>
            <p className="mt-2 text-sm text-amber-800">
              Tutors see your name and booking message. Your email is never shown to other learners.
            </p>
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
                  value={user?.email ?? ''}
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

              <div className="flex justify-end border-t border-green-100 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
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
