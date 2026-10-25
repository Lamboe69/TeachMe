import { describe, it, expect } from 'vitest';
import {
  formatUGX,
  formatRate,
  formatRating,
  formatDate,
  formatTime,
  formatDateTime,
  formatDayLabel,
  formatDuration,
  getInitials,
  firstName,
  humanize,
  toDateInputValue,
} from '@/utils/format';

describe('format', () => {
  it('formats UGX amounts with thousands separators', () => {
    expect(formatUGX(45000)).toBe('UGX 45,000');
    expect(formatUGX(127500)).toBe('UGX 127,500');
    expect(formatUGX(0)).toBe('UGX 0');
  });

  it('returns a dash for null/undefined UGX', () => {
    expect(formatUGX(null)).toBe('UGX —');
    expect(formatUGX(undefined)).toBe('UGX —');
    expect(formatUGX(NaN)).toBe('UGX —');
  });

  it('appends / session to rates', () => {
    expect(formatRate(85000)).toBe('UGX 85,000 / session');
    expect(formatRate(null)).toBe('Rate on request');
  });

  it('formats ratings to one decimal', () => {
    expect(formatRating(4.5)).toBe('4.5');
    expect(formatRating(4)).toBe('4.0');
    expect(formatRating(null)).toBe('New');
  });

  it('formats local (no timezone) dates as EAT wall-clock', () => {
    expect(formatDate('2026-05-12T14:30:00')).toBe('Tue, 12 May 2026');
    expect(formatTime('2026-05-12T14:30:00')).toBe('14:30');
    expect(formatDateTime('2026-05-12T14:30:00')).toBe('Tue, 12 May 2026 at 14:30');
  });

  it('formats day labels relative to today', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yday = new Date(today);
    yday.setDate(yday.getDate() - 1);
    const toISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T09:00:00`;
    expect(formatDayLabel(toISO(today))).toBe('Today');
    expect(formatDayLabel(toISO(tomorrow))).toBe('Tomorrow');
    expect(formatDayLabel(toISO(yday))).toBe('Yesterday');
  });

  it('formats durations', () => {
    expect(formatDuration(30)).toBe('30 min');
    expect(formatDuration(90)).toBe('1 hr 30 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(null)).toBe('60 min');
  });

  it('derives initials and first names', () => {
    expect(getInitials('Mary Namutebi')).toBe('MN');
    expect(getInitials('Sarah')).toBe('SA');
    expect(getInitials(null)).toBe('?');
    expect(firstName('Dr. Sarah Namutebi')).toBe('Sarah');
    expect(firstName('Mary')).toBe('Mary');
    expect(firstName(null)).toBe('there');
  });

  it('humanizes status tokens', () => {
    expect(humanize('REQUESTED')).toBe('Requested');
    expect(humanize('IN_PROGRESS')).toBe('In progress');
    expect(humanize(null)).toBe('Unknown');
  });

  it('produces a yyyy-mm-dd date input value', () => {
    expect(toDateInputValue(new Date(2026, 4, 12))).toBe('2026-05-12');
  });
});