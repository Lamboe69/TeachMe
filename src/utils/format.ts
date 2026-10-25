/**
 * Display formatting helpers.
 *
 * All money is Ugandan Shillings (UGX). Dates are rendered in East Africa
 * Time (EAT, UTC+3). When the backend sends a timestamp without a timezone
 * designator (e.g. `2026-05-12T14:30:00`, typical of a Java `LocalDateTime`)
 * the value is treated as already being EAT and is displayed verbatim rather
 * than being re-interpreted in the browser's timezone.
 */

export const TIMEZONE = 'Africa/Kampala';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HAS_TIMEZONE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function parseParts(value: string): { parts: DateParts; zoned: boolean } | null {
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;

  const parts: DateParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: match[4] ? Number(match[4]) : 0,
    minute: match[5] ? Number(match[5]) : 0,
    second: match[6] ? Number(match[6]) : 0,
  };

  return { parts, zoned: HAS_TIMEZONE.test(value.trim()) };
}

/** Shift a date so that it represents EAT wall-clock time. */
function toEasterClock(date: Date): Date {
  return new Date(date.getTime() + 3 * 60 * 60 * 1000);
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidDate(value: string | null | undefined): boolean {
  return safeDate(value) !== null;
}

/** `45000` -> `UGX 45,000` */
export function formatUGX(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return 'UGX —';
  const rounded = Math.round(amount);
  return `UGX ${rounded.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
}

/** `45000` -> `UGX 45,000 / session` */
export function formatRate(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return 'Rate on request';
  return `${formatUGX(amount)} / session`;
}

/** `4.5` -> `4.5`, `4` -> `4.0` */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || !Number.isFinite(rating)) return 'New';
  return rating.toFixed(1);
}

/** `Mon, 12 May 2026` */
export function formatDate(value: string | null | undefined): string {
  const date = safeDate(value);
  if (!date) return '—';
  const { parts, zoned } = parseParts(value as string) ?? { parts: null, zoned: false };
  if (!zoned && parts) {
    return `${DAYS[new Date(parts.year, parts.month - 1, parts.day).getDay()]}, ${parts.day} ${
      MONTHS[parts.month - 1]
    } ${parts.year}`;
  }
  const eat = toEasterClock(date);
  return `${DAYS[eat.getUTCDay()]}, ${eat.getUTCDate()} ${MONTHS[eat.getUTCMonth()]} ${eat.getUTCFullYear()}`;
}

/** `14:30` */
export function formatTime(value: string | null | undefined): string {
  const date = safeDate(value);
  if (!date) return '—';
  const { parts, zoned } = parseParts(value as string) ?? { parts: null, zoned: false };
  if (!zoned && parts) {
    return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
  }
  const eat = toEasterClock(date);
  return `${String(eat.getUTCHours()).padStart(2, '0')}:${String(eat.getUTCMinutes()).padStart(2, '0')}`;
}

/** `Mon, 12 May 2026 at 14:30` */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return `${formatDate(value)} at ${formatTime(value)}`;
}

/** `Today`, `Tomorrow` or the short date. */
export function formatDayLabel(value: string | null | undefined): string {
  const date = safeDate(value);
  if (!date) return '—';
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return formatDate(value);
}

/** `in 3 days`, `2 hours ago`, `just now` */
export function formatRelative(value: string | null | undefined): string {
  const date = safeDate(value);
  if (!date) return '';
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['week', 604_800_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];

  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return 'just now';
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '60 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** `Mary Namutebi` -> `MN` */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const TITLES = new Set(['dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'miss', 'prof', 'prof.']);

/**
 * The name we greet someone by.
 *
 * Titles are skipped so `Dr. Sarah Namutebi` is greeted as `Sarah` rather
 * than `Dr.`.
 */
export function firstName(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = parts.find((part) => !TITLES.has(part.toLowerCase()));
  return first ?? 'there';
}

/** `REQUESTED` -> `Requested` */
export function humanize(value: string | null | undefined): string {
  if (!value) return 'Unknown';
  const lower = value.toLowerCase().replace(/[_\s]+/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Value for an `<input type="datetime-local">` derived from an ISO string. */
export function toDateTimeLocalValue(value: string | null | undefined): string {
  const date = safeDate(value);
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Value for an `<input type="date">` derived from a `Date`. */
export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Combine a `<input type="date">` value and a `<input type="time">` value into an ISO-ish local string. */
export function combineDateAndTime(date: string, time: string): string {
  if (!date) return '';
  const safeTime = time && /^\d{2}:\d{2}$/.test(time) ? time : '09:00';
  return `${date}T${safeTime}:00`;
}
