import type { Session, SessionStatus, User } from '@/types';

/**
 * Which actions the UI offers for a given session.
 *
 * The backend remains authoritative: these flags only decide what is
 * *offered*. Every action still goes through the API and the UI refreshes
 * the session from the server response before claiming success.
 */
export interface SessionActions {
  canAccept: boolean;
  canReject: boolean;
  canComplete: boolean;
  canCancel: boolean;
  canReview: boolean;
  canMessage: boolean;
}

const NO_ACTIONS: SessionActions = {
  canAccept: false,
  canReject: false,
  canComplete: false,
  canCancel: false,
  canReview: false,
  canMessage: false,
};

export function isTutorOwner(session: Session, user: User | null): boolean {
  return !!user && session.tutor?.id === user.id;
}

export function isStudentOwner(session: Session, user: User | null): boolean {
  return !!user && session.student?.id === user.id;
}

export function getSessionActions(session: Session, user: User | null): SessionActions {
  if (!session || !user) return NO_ACTIONS;

  const status: SessionStatus = session.status;

  if (isTutorOwner(session, user)) {
    switch (status) {
      case 'REQUESTED':
        return { ...NO_ACTIONS, canAccept: true, canReject: true };
      case 'ACCEPTED':
        return {
          ...NO_ACTIONS,
          canComplete: !session.tutorConfirmedAt && isPast(session),
          canCancel: true,
        };
      default:
        return NO_ACTIONS;
    }
  }

  if (isStudentOwner(session, user)) {
    switch (status) {
      case 'REQUESTED':
        return { ...NO_ACTIONS, canCancel: true, canMessage: true };
      case 'ACCEPTED':
        return {
          ...NO_ACTIONS,
          canCancel: true,
          canMessage: true,
          // Both parties confirm independently once the session has taken place.
          canComplete: !session.studentConfirmedAt && isPast(session),
        };
      case 'COMPLETED':
        return {
          ...NO_ACTIONS,
          canReview: !session.hasReview,
          canMessage: true,
        };
      default:
        return NO_ACTIONS;
    }
  }

  return NO_ACTIONS;
}

/** Sessions that still need a decision from the tutor. */
export function isPendingRequest(session: Session): boolean {
  return session.status === 'REQUESTED';
}

/** Sessions that are scheduled to happen in the future. */
export function isUpcoming(session: Session): boolean {
  if (session.status !== 'ACCEPTED' && session.status !== 'REQUESTED') return false;
  const time = new Date(session.scheduledAt).getTime();
  return Number.isFinite(time) ? time >= Date.now() - 60 * 60 * 1000 : false;
}

export function isPast(session: Session): boolean {
  const time = new Date(session.scheduledAt).getTime();
  return Number.isFinite(time) ? time < Date.now() : false;
}

/** Human friendly label + tone for each status. */
export const SESSION_STATUS_META: Record<
  SessionStatus,
  { label: string; tone: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'neutral' }
> = {
  REQUESTED: { label: 'Awaiting response', tone: 'pending' },
  ACCEPTED: { label: 'Confirmed', tone: 'accepted' },
  COMPLETED: { label: 'Completed', tone: 'completed' },
  CANCELLED: { label: 'Cancelled', tone: 'cancelled' },
  REJECTED: { label: 'Declined', tone: 'cancelled' },
  UNKNOWN: { label: 'Unknown', tone: 'neutral' },
};
