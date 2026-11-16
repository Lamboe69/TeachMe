import { useCallback, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock, Star, XCircle } from 'lucide-react';
import type { Session } from '@/types';

export type NotificationTone = 'volt' | 'cobalt' | 'danger';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  to: string;
  at: number;
  icon: typeof Bell;
  tone: NotificationTone;
}

const LAST_SEEN_KEY = 'tutorug.notifications.lastSeen';

const TONE_COLOR: Record<NotificationTone, string> = {
  volt: '#D4FF24',
  cobalt: '#1558C9',
  danger: '#ff8080',
};

export function notificationToneColor(tone: NotificationTone): string {
  return TONE_COLOR[tone];
}

const HOUR = 3_600_000;

/**
 * Derives a learner's (or tutor's) notifications from their sessions.
 *
 * There is no notifications endpoint yet, and everything shown here is a
 * direct consequence of session state the user can already see — so deriving
 * it client-side keeps the bell honest and needs no backend change.
 */
export function buildNotifications(
  sessions: Session[],
  isTutor: boolean,
): AppNotification[] {
  const items: AppNotification[] = [];
  const now = Date.now();

  sessions.forEach((session) => {
    const at = new Date(session.updatedAt ?? session.scheduledAt).getTime();
    const stamp = Number.isFinite(at) ? at : now;
    const scheduled = new Date(session.scheduledAt).getTime();
    const hoursTo = (scheduled - now) / HOUR;
    const soon = hoursTo > 0 && hoursTo <= 24;

    if (isTutor) {
      if (session.status === 'REQUESTED') {
        items.push({
          id: `request-${session.id}`,
          title: 'New booking request',
          body: `${session.student.fullName} asked for ${session.subject}`,
          to: `/sessions/${session.id}`,
          at: stamp,
          icon: Bell,
          tone: 'volt',
        });
      } else if (session.status === 'ACCEPTED' && soon) {
        items.push({
          id: `reminder-${session.id}`,
          title: 'Session coming up',
          body: `${session.subject} with ${session.student.fullName}`,
          to: `/sessions/${session.id}`,
          at: stamp,
          icon: Clock,
          tone: 'cobalt',
        });
      }
      return;
    }

    if (session.status === 'ACCEPTED' && soon) {
      items.push({
        id: `reminder-${session.id}`,
        title: 'Session reminder',
        body: `${session.subject} with ${session.tutor.fullName}`,
        to: `/sessions/${session.id}`,
        at: stamp,
        icon: Clock,
        tone: 'cobalt',
      });
    } else if (session.status === 'ACCEPTED') {
      items.push({
        id: `confirmed-${session.id}`,
        title: 'Session confirmed',
        body: `${session.tutor.fullName} confirmed your ${session.subject} session`,
        to: `/sessions/${session.id}`,
        at: stamp,
        icon: CheckCircle2,
        tone: 'volt',
      });
    } else if (session.status === 'REQUESTED') {
      items.push({
        id: `pending-${session.id}`,
        title: 'Awaiting confirmation',
        body: `${session.tutor.fullName} has not responded yet`,
        to: `/sessions/${session.id}`,
        at: stamp,
        icon: Clock,
        tone: 'cobalt',
      });
    } else if (session.status === 'COMPLETED' && !session.hasReview) {
      items.push({
        id: `review-${session.id}`,
        title: 'Leave a review',
        body: `How was your ${session.subject} session with ${session.tutor.fullName}?`,
        to: `/sessions/${session.id}/feedback`,
        at: stamp,
        icon: Star,
        tone: 'volt',
      });
    } else if (session.status === 'CANCELLED' || session.status === 'REJECTED') {
      items.push({
        id: `closed-${session.id}`,
        title: session.status === 'REJECTED' ? 'Request declined' : 'Session cancelled',
        body: `${session.subject} · the fee was refunded to your wallet`,
        to: `/sessions/${session.id}`,
        at: stamp,
        icon: XCircle,
        tone: 'danger',
      });
    }
  });

  return items.sort((a, b) => b.at - a.at).slice(0, 8);
}

export function useNotifications(sessions: Session[], isTutor: boolean) {
  const [lastSeen, setLastSeen] = useState(() => {
    try {
      return Number(window.localStorage.getItem(LAST_SEEN_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  const notifications = useMemo(
    () => buildNotifications(sessions, isTutor),
    [sessions, isTutor],
  );

  const unread = useMemo(
    () => notifications.filter((item) => item.at > lastSeen).length,
    [notifications, lastSeen],
  );

  const markAllRead = useCallback(() => {
    const now = Date.now();
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, String(now));
    } catch {
      /* ignore */
    }
    setLastSeen(now);
  }, []);

  return { notifications, unread, markAllRead };
}
