import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Clock, Info } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { expandAvailabilitySlot, WEEK_DAYS } from '@/utils/availability';
import type { AvailabilitySlot } from '@/types';

const TIME_SLOTS = Array.from({ length: 15 }, (_, index) => {
  const hours = String(7 + index).padStart(2, '0');
  return `${hours}:00`;
});

type WeeklySelection = Record<string, string[]>;

function emptySelection(): WeeklySelection {
  return Object.fromEntries(WEEK_DAYS.map((day) => [day, []]));
}

function endAfterLastSlot(slot: string): string {
  const [hours = '0', minutes = '0'] = slot.split(':');
  return `${String(Number(hours) + 1).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };

export function TutorAvailabilityPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const tutorState = useAsyncData(async () => {
    if (!user) return null;
    try { return await services.tutors.get(user.id); } catch { return null; }
  }, [user?.id]);

  const [availability, setAvailability] = useState<WeeklySelection>(emptySelection);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tutorState.loading || hydrated) return;
    const stored = tutorState.data?.availability ?? [];
    const next = emptySelection();
    for (const day of WEEK_DAYS) {
      const slots = stored
        .filter((slot) => slot.day === day)
        .flatMap(expandAvailabilitySlot)
        .filter((time) => TIME_SLOTS.includes(time));
      next[day] = [...new Set(slots)].sort();
    }
    setAvailability(next);
    setHydrated(true);
  }, [tutorState.loading, tutorState.data, hydrated]);

  const selectedCount = useMemo(
    () => Object.values(availability).reduce((total, slots) => total + slots.length, 0),
    [availability],
  );

  function toggle(day: string, slot: string) {
    setSaved(false);
    setAvailability((previous) => {
      const current = previous[day] ?? [];
      return {
        ...previous,
        [day]: current.includes(slot)
          ? current.filter((time) => time !== slot)
          : [...current, slot].sort(),
      };
    });
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const payload: AvailabilitySlot[] = WEEK_DAYS.map((day) => {
        const slots = availability[day] ?? [];
        if (slots.length === 0) return { day, enabled: false, start: '09:00', end: '17:00' };
        return { day, enabled: true, start: slots[0], end: endAfterLastSlot(slots[slots.length - 1]), slots };
      });
      await services.users.updateMe({ availability: payload });
      await refreshUser();
      setSaved(true);
      toast.success('Availability saved', 'Students will only see these times when booking.');
    } catch (caught) {
      const appError = toAppError(caught);
      setError(appError.message);
      toast.error('Could not save your availability', appError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Availability">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: '#D4FF24' }}>Teaching schedule</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My availability</h2>
        <p className="mt-2 text-white/55">
          Select the time slots when you are available to teach. Students can only book sessions during these times.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl" style={cardStyle}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-5" style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: 'rgba(212,255,36,0.12)' }}>
              <Clock className="h-4 w-4" style={{ color: '#D4FF24' }} />
            </div>
            <h3 className="text-lg font-bold text-white">Weekly schedule</h3>
          </div>
          <p className="text-sm text-white/40">Click a slot to toggle it on or off</p>
        </div>

        {tutorState.loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg" style={{ background: 'rgba(21,88,201,0.15)' }} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(21,88,201,0.2)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 w-20">Time</th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day} className="px-2 py-3 text-center text-xs font-bold text-white/70">
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} style={{ borderBottom: '1px solid rgba(21,88,201,0.1)' }}>
                    <td className="px-4 py-2 text-xs font-medium text-white/40">{slot}</td>
                    {WEEK_DAYS.map((day) => {
                      const active = (availability[day] ?? []).includes(slot);
                      return (
                        <td key={day} className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(day, slot)}
                            aria-label={`${active ? 'Remove' : 'Add'} ${day} ${slot}`}
                            aria-pressed={active}
                            className="mx-auto grid h-8 w-8 place-items-center rounded-lg transition-all duration-150"
                            style={active
                              ? { background: '#1558C9', boxShadow: '0 0 14px rgba(21,88,201,0.6), inset 0 1px 0 rgba(255,255,255,0.15)' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                            }
                          >
                            {active && <Check className="h-4 w-4" style={{ color: '#D4FF24' }} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5" style={{ borderTop: '1px solid rgba(21,88,201,0.2)' }}>
          <p className="text-sm text-white/50">
            <span className="font-bold text-white">{selectedCount}</span> {selectedCount === 1 ? 'slot' : 'slots'} selected across the week
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || tutorState.loading}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
            style={{ background: '#D4FF24', color: '#030407' }}
          >
            {saving ? 'Saving…' : 'Save availability'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff8080' }}>
          {error}
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl p-6" style={saved
        ? { background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.2)' }
        : { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' }
      }>
        {saved
          ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#D4FF24' }} />
          : <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
        }
        <div>
          <p className="font-bold text-white">{saved ? 'Saved to your tutor profile' : 'How availability works'}</p>
          <p className="mt-1 text-sm text-white/50">
            {saved
              ? 'Your selected times are live. Students cannot request sessions outside them.'
              : 'Leave a day empty to stay unavailable. Your schedule is saved to the tutor profile students browse, so keep it realistic.'
            }
          </p>
        </div>
      </div>
    </AppShell>
  );
}
