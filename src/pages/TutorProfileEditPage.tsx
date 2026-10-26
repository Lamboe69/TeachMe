import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Home,
  MapPin,
  Save,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { formatRate, getInitials } from '@/utils/format';
import type { AvailabilitySlot } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_OPTIONS = Array.from({ length: 25 }, (_, index) => {
  const hours = String(8 + Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

function defaultAvailability(): AvailabilitySlot[] {
  return DAYS.map((day, index) => ({
    day,
    enabled: index < 5,
    start: '09:00',
    end: '17:00',
  }));
}

interface FormState {
  fullName: string;
  phone: string;
  bio: string;
  subjects: string;
  hourlyRate: string;
  location: string;
  yearsExperience: string;
}

export function TutorProfileEditPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const showingAvailability = location.pathname.endsWith('/availability');

  const tutorState = useAsyncData(async () => {
    if (!user) return null;
    try {
      return await services.tutors.get(user.id);
    } catch {
      return null;
    }
  }, [user?.id]);

  const [form, setForm] = useState<FormState>({
    fullName: '',
    phone: '',
    bio: '',
    subjects: '',
    hourlyRate: '',
    location: '',
    yearsExperience: '',
  });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const originalAvailability = useRef<Record<string, AvailabilitySlot>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || tutorState.loading) return;
    const tutor = tutorState.data;
    setForm({
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      subjects: (tutor?.subjects ?? []).join(', '),
      hourlyRate: tutor?.hourlyRate ? String(tutor.hourlyRate) : '',
      location: tutor?.location ?? '',
      yearsExperience: tutor?.yearsExperience !== null && tutor?.yearsExperience !== undefined
        ? String(tutor.yearsExperience)
        : '',
    });
    const stored = tutor?.availability ?? [];
    const mapped = DAYS.map((day): AvailabilitySlot => {
      const entries = stored.filter((slot) => slot.day === day);
      const enabledEntries = entries.filter((slot) => slot.enabled);
      if (enabledEntries.length === 0) {
        return { day, enabled: false, start: '09:00', end: '17:00' };
      }
      const starts = enabledEntries.map((slot) => slot.start).sort();
      const ends = enabledEntries.map((slot) => slot.end).sort();
      const slots = enabledEntries.flatMap((slot) => slot.slots ?? []);
      return {
        day,
        enabled: true,
        start: starts[0],
        end: ends[ends.length - 1],
        slots: slots.length > 0 ? [...new Set(slots)].sort() : undefined,
      };
    });
    originalAvailability.current = Object.fromEntries(mapped.map((slot) => [slot.day, slot]));
    setAvailability(mapped);
  }, [user, tutorState.loading, tutorState.data]);

  const subjectsPreview = useMemo(
    () => form.subjects.split(',').map((item) => item.trim()).filter(Boolean),
    [form.subjects],
  );

  const rate = Number(form.hourlyRate);
  const preview = {
    name: form.fullName || user?.fullName || 'Your name',
    subjects: subjectsPreview,
    rate: Number.isFinite(rate) && rate > 0 ? rate : tutorState.data?.hourlyRate ?? null,
    rating: tutorState.data?.rating ?? null,
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!form.fullName.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (form.hourlyRate && (!Number.isFinite(rate) || rate < 1000)) {
      setError('Enter a session rate of at least UGX 1,000, or leave it blank.');
      return;
    }
    for (const slot of availability) {
      if (slot.enabled && slot.start >= slot.end) {
        setError(`${slot.day}: the end time must be after the start time.`);
        return;
      }
    }

    const availabilityPayload = availability.map((slot): AvailabilitySlot => {
      const original = originalAvailability.current[slot.day];
      const unchanged =
        !!original &&
        original.enabled === slot.enabled &&
        original.start === slot.start &&
        original.end === slot.end;
      return {
        ...slot,
        slots: unchanged && original?.slots ? original.slots : undefined,
      };
    });

    setSaving(true);
    try {
      await services.users.updateMe({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        subjects: subjectsPreview,
        hourlyRate: form.hourlyRate ? Math.round(rate) : undefined,
        location: form.location.trim(),
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        availability: availabilityPayload,
      });
      await refreshUser();
      setSaved(true);
      toast.success('Profile updated', 'Your tutor profile is now up to date.');
      window.setTimeout(() => setSaved(false), 3000);
    } catch (caught) {
      const appError = toAppError(caught);
      setError(appError.message);
      toast.error('Could not save your profile', appError.message);
    } finally {
      setSaving(false);
    }
  }

  function updateAvailability(day: string, patch: Partial<AvailabilitySlot>) {
    setAvailability((current) =>
      current.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)),
    );
  }

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
            <Link to="/tutor/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link to="/sessions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition">
              <Wallet className="h-5 w-5" />
              Wallet
            </Link>
            <Link
              to="/tutor/profile/edit"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                !showingAvailability
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                  : 'text-ink-700 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              <User className="h-5 w-5" />
              My profile
            </Link>
            <Link
              to="/tutor/availability"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                showingAvailability
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                  : 'text-ink-700 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              <Clock className="h-5 w-5" />
              Availability
            </Link>
          </nav>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-ink-950">
                {showingAvailability ? 'Availability' : 'My profile'}
              </h1>
              <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                  {user?.fullName?.charAt(0)}
                </div>
                <span className="hidden text-sm font-semibold text-ink-900 sm:inline">
                  {user?.fullName}
                </span>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
                {showingAvailability ? 'Teaching availability' : 'My tutor profile'}
              </h2>
              <p className="mt-2 text-lg text-ink-700">
                {showingAvailability
                  ? 'Set the days and times students can book you.'
                  : 'Students see this information when deciding who to book.'}
              </p>
            </div>

            {tutorState.loading ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-green-200" />
                <div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-green-200 lg:col-span-2" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-green-200">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-3xl font-black text-white">
                      {getInitials(preview.name)}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-ink-950">{preview.name}</h3>
                    <p className="mt-1 text-sm text-ink-600">{user?.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Tutor
                      </span>
                      {preview.rating ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {preview.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 border-t border-green-100 pt-4 text-lg font-black text-ink-950">
                      {preview.rate ? formatRate(preview.rate) : 'Rate not set'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 ring-1 ring-amber-200">
                    <p className="flex items-center gap-2 font-bold text-amber-900">
                      <CheckCircle2 className="h-4 w-4" />
                      Profile tips
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-amber-900/85">
                      <li>List the exact course units you teach.</li>
                      <li>Keep your bio short and student-friendly.</li>
                      <li>Set realistic times you can actually attend.</li>
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
                  <section className="rounded-2xl bg-white shadow-lg ring-1 ring-green-200">
                    <div className="border-b border-green-100 px-6 py-5">
                      <h3 className="text-lg font-bold text-ink-950">Profile details</h3>
                      <p className="mt-1 text-sm text-ink-600">Your public tutor information</p>
                    </div>
                    <div className="space-y-5 p-6">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="tutor-name" className="mb-2 block text-sm font-semibold text-ink-900">
                            Full name *
                          </label>
                          <input
                            id="tutor-name"
                            value={form.fullName}
                            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                            className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                        <div>
                          <label htmlFor="tutor-phone" className="mb-2 block text-sm font-semibold text-ink-900">
                            Phone number
                          </label>
                          <input
                            id="tutor-phone"
                            type="tel"
                            value={form.phone}
                            onChange={(event) => setForm({ ...form, phone: event.target.value })}
                            placeholder="+256 7XX XXX XXX"
                            className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="tutor-bio" className="mb-2 block text-sm font-semibold text-ink-900">
                          Short bio
                        </label>
                        <textarea
                          id="tutor-bio"
                          rows={4}
                          value={form.bio}
                          onChange={(event) => setForm({ ...form, bio: event.target.value })}
                          placeholder="Tell students what you study, what you teach and how you help."
                          className="w-full rounded-xl border border-ink-300 px-4 py-3 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="tutor-subjects" className="mb-2 block text-sm font-semibold text-ink-900">
                          Course units you teach
                        </label>
                        <input
                          id="tutor-subjects"
                          value={form.subjects}
                          onChange={(event) => setForm({ ...form, subjects: event.target.value })}
                          placeholder="e.g. Calculus, Database Systems, Statistics"
                          className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                        />
                        <p className="mt-1 text-xs text-ink-500">Separate each course unit with a comma.</p>
                        {subjectsPreview.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {subjectsPreview.map((subject) => (
                              <span key={subject} className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                          <label htmlFor="tutor-rate" className="mb-2 block text-sm font-semibold text-ink-900">
                            Rate per session (UGX)
                          </label>
                          <input
                            id="tutor-rate"
                            inputMode="numeric"
                            value={form.hourlyRate}
                            onChange={(event) => setForm({ ...form, hourlyRate: event.target.value.replace(/[^\d]/g, '') })}
                            placeholder="35000"
                            className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                        <div>
                          <label htmlFor="tutor-location" className="mb-2 block text-sm font-semibold text-ink-900">
                            Campus / location
                          </label>
                          <input
                            id="tutor-location"
                            value={form.location}
                            onChange={(event) => setForm({ ...form, location: event.target.value })}
                            placeholder="Makerere University"
                            className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                        <div>
                          <label htmlFor="tutor-years" className="mb-2 block text-sm font-semibold text-ink-900">
                            Years of study
                          </label>
                          <input
                            id="tutor-years"
                            inputMode="numeric"
                            value={form.yearsExperience}
                            onChange={(event) => setForm({ ...form, yearsExperience: event.target.value.replace(/[^\d]/g, '') })}
                            placeholder="2"
                            className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-white shadow-lg ring-1 ring-green-200">
                    <div className="border-b border-green-100 px-6 py-5">
                      <h3 className="text-lg font-bold text-ink-950">Weekly availability</h3>
                      <p className="mt-1 text-sm text-ink-600">
                        Students can only request sessions inside these windows.
                      </p>
                    </div>
                    <div className="divide-y divide-green-100">
                      {availability.map((slot) => (
                        <div key={slot.day} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                          <label className="flex flex-1 items-center gap-3">
                            <input
                              type="checkbox"
                              checked={slot.enabled}
                              onChange={(event) => updateAvailability(slot.day, { enabled: event.target.checked })}
                              className="h-5 w-5 rounded border-ink-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="font-semibold text-ink-900">{slot.day}</span>
                          </label>
                          {slot.enabled ? (
                            <div className="flex items-center gap-2">
                              <select
                                aria-label={`${slot.day} start time`}
                                value={slot.start}
                                onChange={(event) => updateAvailability(slot.day, { start: event.target.value })}
                                className="h-10 rounded-lg border border-ink-300 px-2 text-sm text-ink-900 focus:border-green-500 focus:outline-none"
                              >
                                {TIME_OPTIONS.slice(0, -1).map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <span className="text-ink-500">to</span>
                              <select
                                aria-label={`${slot.day} end time`}
                                value={slot.end}
                                onChange={(event) => updateAvailability(slot.day, { end: event.target.value })}
                                className="h-10 rounded-lg border border-ink-300 px-2 text-sm text-ink-900 focus:border-green-500 focus:outline-none"
                              >
                                {TIME_OPTIONS.slice(1).map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-sm text-ink-500">Unavailable</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-green-200">
                    {saved ? (
                      <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Changes saved
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-ink-600">
                        <MapPin className="h-4 w-4 text-green-700" />
                        All changes are visible to students immediately.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3 font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
