import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Save,
  Star,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
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
  return DAYS.map((day, index) => ({ day, enabled: index < 5, start: '09:00', end: '17:00' }));
}

interface FormState {
  fullName: string; phone: string; bio: string; subjects: string;
  hourlyRate: string; location: string; yearsExperience: string;
}

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const inputClass = 'h-12 w-full rounded-xl px-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' };
const selectStyle = { border: '1px solid rgba(21,88,201,0.45)', color: 'white', background: 'rgba(21,88,201,0.08)' };

export function TutorProfileEditPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const tutorState = useAsyncData(async () => {
    if (!user) return null;
    try { return await services.tutors.get(user.id); } catch { return null; }
  }, [user?.id]);

  const [form, setForm] = useState<FormState>({
    fullName: '', phone: '', bio: '', subjects: '', hourlyRate: '', location: '', yearsExperience: '',
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
      yearsExperience: tutor?.yearsExperience != null ? String(tutor.yearsExperience) : '',
    });
    const stored = tutor?.availability ?? [];
    const mapped = DAYS.map((day): AvailabilitySlot => {
      const entries = stored.filter((s) => s.day === day);
      const enabled = entries.filter((s) => s.enabled);
      if (enabled.length === 0) return { day, enabled: false, start: '09:00', end: '17:00' };
      const starts = enabled.map((s) => s.start).sort();
      const ends = enabled.map((s) => s.end).sort();
      const slots = enabled.flatMap((s) => s.slots ?? []);
      return { day, enabled: true, start: starts[0], end: ends[ends.length - 1], slots: slots.length > 0 ? [...new Set(slots)].sort() : undefined };
    });
    originalAvailability.current = Object.fromEntries(mapped.map((s) => [s.day, s]));
    setAvailability(mapped);
  }, [user, tutorState.loading, tutorState.data]);

  const subjectsPreview = useMemo(
    () => form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
    [form.subjects],
  );

  const rate = Number(form.hourlyRate);
  const preview = {
    name: form.fullName || user?.fullName || 'Your name',
    rate: Number.isFinite(rate) && rate > 0 ? rate : tutorState.data?.hourlyRate ?? null,
    rating: tutorState.data?.rating ?? null,
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null); setSaved(false);
    if (!form.fullName.trim()) { setError('Enter your full name.'); return; }
    if (form.hourlyRate && (!Number.isFinite(rate) || rate < 1000)) { setError('Enter a session rate of at least UGX 1,000, or leave it blank.'); return; }
    for (const slot of availability) {
      if (slot.enabled && slot.start >= slot.end) { setError(`${slot.day}: end time must be after start time.`); return; }
    }
    const availabilityPayload = availability.map((slot): AvailabilitySlot => {
      const original = originalAvailability.current[slot.day];
      const unchanged = !!original && original.enabled === slot.enabled && original.start === slot.start && original.end === slot.end;
      return { ...slot, slots: unchanged && original?.slots ? original.slots : undefined };
    });
    setSaving(true);
    try {
      await services.users.updateMe({
        fullName: form.fullName.trim(), phone: form.phone.trim(), bio: form.bio.trim(),
        subjects: subjectsPreview, hourlyRate: form.hourlyRate ? Math.round(rate) : undefined,
        location: form.location.trim(), yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
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
    } finally { setSaving(false); }
  }

  function updateAvailability(day: string, patch: Partial<AvailabilitySlot>) {
    setAvailability((current) => current.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)));
  }

  return (
    <AppShell title="My profile">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: '#D4FF24' }}>Tutor account</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My tutor profile</h2>
        <p className="mt-2 text-white/55">Students see this information when deciding who to book.</p>
      </div>

      {tutorState.loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl" style={cardStyle} />
          <div className="h-96 animate-pulse rounded-2xl lg:col-span-2" style={cardStyle} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-8 text-center" style={cardStyle}>
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full text-3xl font-black" style={{ background: '#1558C9', color: '#D4FF24' }}>
                {getInitials(preview.name)}
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{preview.name}</h3>
              <p className="mt-1 text-sm text-white/50">{user?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(21,88,201,0.25)', color: '#7eb3ff', border: '1px solid rgba(21,88,201,0.4)' }}>
                  <BadgeCheck className="h-3.5 w-3.5" /> Tutor
                </span>
                {preview.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(212,255,36,0.12)', color: '#D4FF24', border: '1px solid rgba(212,255,36,0.25)' }}>
                    <Star className="h-3.5 w-3.5 fill-current" /> {preview.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 pt-4 text-lg font-black text-white" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
                {preview.rate ? formatRate(preview.rate) : <span className="text-white/40 text-sm font-normal">Rate not set</span>}
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }}>
              <p className="flex items-center gap-2 font-bold text-sm" style={{ color: '#D4FF24' }}>
                <CheckCircle2 className="h-4 w-4" /> Profile tips
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/55">
                <li>List the exact course units you teach.</li>
                <li>Keep your bio short and student-friendly.</li>
                <li>Set realistic times you can actually attend.</li>
              </ul>
            </div>
          </div>

          {/* Right form */}
          <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
            {/* Profile details */}
            <div className="overflow-hidden rounded-2xl" style={cardStyle}>
              <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
                <h3 className="text-lg font-bold text-white">Profile details</h3>
                <p className="mt-1 text-sm text-white/50">Your public tutor information</p>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/80">Full name *</label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} style={inputStyle} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/80">Phone number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+256 7XX XXX XXX" className={inputClass} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/80">Short bio</label>
                  <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell students what you study, what you teach and how you help." className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]" style={inputStyle} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-white/80">Course units you teach</label>
                  <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="e.g. Calculus, Database Systems, Statistics" className={inputClass} style={inputStyle} />
                  <p className="mt-1 text-xs text-white/30">Separate each course unit with a comma.</p>
                  {subjectsPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subjectsPreview.map((subject) => (
                        <span key={subject} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(21,88,201,0.25)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(21,88,201,0.4)' }}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/80">Rate per session (UGX)</label>
                    <input inputMode="numeric" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value.replace(/[^\d]/g, '') })} placeholder="35000" className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/80">Campus / location</label>
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Makerere University" className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-white/80">Years of study</label>
                    <input inputMode="numeric" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value.replace(/[^\d]/g, '') })} placeholder="2" className={inputClass} style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly availability */}
            <div className="overflow-hidden rounded-2xl" style={cardStyle}>
              <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
                <h3 className="text-lg font-bold text-white">Weekly availability</h3>
                <p className="mt-1 text-sm text-white/50">Students can only request sessions inside these windows.</p>
              </div>
              <div>
                {availability.map((slot, idx) => (
                  <div key={slot.day} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center" style={idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.12)' } : {}}>
                    <label className="flex flex-1 items-center gap-3 cursor-pointer">
                      <div
                        className="grid h-5 w-5 place-items-center rounded"
                        style={slot.enabled ? { background: '#1558C9', border: '2px solid #1558C9' } : { background: 'transparent', border: '2px solid rgba(255,255,255,0.2)' }}
                        onClick={() => updateAvailability(slot.day, { enabled: !slot.enabled })}
                      >
                        {slot.enabled && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className="font-semibold text-white">{slot.day}</span>
                    </label>
                    {slot.enabled ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            aria-label={`${slot.day} start time`}
                            value={slot.start}
                            onChange={(e) => updateAvailability(slot.day, { start: e.target.value })}
                            className="h-10 appearance-none rounded-lg pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-[#1558C9] focus:border-[#1558C9] transition cursor-pointer"
                            style={selectStyle}
                          >
                            {TIME_OPTIONS.slice(0, -1).map((time) => <option key={time} value={time} style={{ background: '#0d1526' }}>{time}</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1558C9]" aria-hidden="true" />
                        </div>
                        <span className="text-white/40 text-sm">to</span>
                        <div className="relative">
                          <select
                            aria-label={`${slot.day} end time`}
                            value={slot.end}
                            onChange={(e) => updateAvailability(slot.day, { end: e.target.value })}
                            className="h-10 appearance-none rounded-lg pl-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-[#1558C9] focus:border-[#1558C9] transition cursor-pointer"
                            style={selectStyle}
                          >
                            {TIME_OPTIONS.slice(1).map((time) => <option key={time} value={time} style={{ background: '#0d1526' }}>{time}</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1558C9]" aria-hidden="true" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-white/30">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff8080' }}>
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5" style={cardStyle}>
              {saved ? (
                <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#D4FF24' }}>
                  <CheckCircle2 className="h-4 w-4" /> Changes saved
                </p>
              ) : (
                <p className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin className="h-4 w-4" style={{ color: '#1558C9' }} />
                  All changes are visible to students immediately.
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: '#D4FF24', color: '#030407' }}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
