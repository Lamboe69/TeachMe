import type { AvailabilitySlot } from '@/types';

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function toTime(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

/** Bookable start times for one availability entry. */
export function expandAvailabilitySlot(slot: AvailabilitySlot): string[] {
  if (!slot.enabled) return [];
  if (slot.slots && slot.slots.length > 0) {
    return [...new Set(slot.slots)].sort();
  }

  const start = toMinutes(slot.start);
  const end = toMinutes(slot.end);
  const times: string[] = [];
  for (let current = start; current < end; current += 60) {
    times.push(toTime(current));
  }
  return times;
}

/** Every bookable start time for a given weekday. */
export function availabilityForDay(
  availability: AvailabilitySlot[] | null | undefined,
  day: string,
): string[] {
  if (!availability || availability.length === 0) return [];
  return availability
    .filter((slot) => slot.day === day)
    .flatMap(expandAvailabilitySlot)
    .sort();
}

/** Weekday name for a `YYYY-MM-DD` date, using the same names as the schedule. */
export function weekdayForDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString('en-US', { weekday: 'long' });
}

/** Short weekly summary shown next to a tutor in the directory. */
export function availabilitySummary(
  availability: AvailabilitySlot[] | null | undefined,
): string | null {
  if (!availability || availability.length === 0) return null;
  const active = availability.filter((slot) => slot.enabled && slot.day);
  if (active.length === 0) return null;

  const days = WEEK_DAYS.filter((day) => active.some((slot) => slot.day === day));
  const labels = days.map((day) => day.slice(0, 3));
  const indices = days.map((day) => WEEK_DAYS.indexOf(day));
  const consecutive = indices.every((value, index) => index === 0 || value === indices[index - 1] + 1);
  let dayLabel: string;
  if (labels.length <= 3) {
    dayLabel = labels.join(', ');
  } else if (consecutive) {
    dayLabel = `${labels[0]}–${labels[labels.length - 1]}`;
  } else {
    dayLabel = `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
  }

  const starts = active.map((slot) => slot.start).sort();
  const ends = active.map((slot) => slot.end).sort();
  return `${dayLabel} · ${starts[0]}–${ends[ends.length - 1]}`;
}
