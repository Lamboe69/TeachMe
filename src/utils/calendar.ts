import type { Session } from '@/types';

/**
 * Build a calendar (.ics) entry for a booked session so learners can drop it
 * straight into the calendar app they already use — recognition, not recall.
 */

function toIcsStamp(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}` +
    `T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}${pad(value.getUTCSeconds())}Z`
  );
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildSessionIcs(session: Session): string {
  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + (session.durationMinutes ?? 60) * 60_000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TutorUG//Session//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${session.id}@tutorug.ug`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeText(`${session.subject} tutoring with ${session.tutor.fullName}`)}`,
    `DESCRIPTION:${escapeText(
      `TutorUG ${session.subject} session. The fee is held in escrow until the session is completed and confirmed.`,
    )}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function sessionIcsHref(session: Session): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildSessionIcs(session))}`;
}

export function sessionIcsFilename(session: Session): string {
  const safe = session.subject.replace(/[^\w]+/g, '-').toLowerCase().replace(/^-|-$/g, '');
  return `tutorug-${safe || 'session'}.ics`;
}
