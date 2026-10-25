import { useCallback, useState } from 'react';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import type { AppError } from '@/utils/apiError';
import type { Session } from '@/types';

export type SessionAction = 'accept' | 'reject' | 'complete' | 'cancel';

const STATUS_FOR_ACTION: Record<SessionAction, string> = {
  accept: 'ACCEPTED',
  reject: 'REJECTED',
  complete: 'COMPLETED',
  cancel: 'CANCELLED',
};

/**
 * Mutations for a single session.
 *
 * The UI only updates after the server confirms the change, and the
 * authoritative session returned by the API replaces the local copy.
 */
export function useSessionMutations(onUpdated?: (session: Session) => void) {
  const [pendingAction, setPendingAction] = useState<SessionAction | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const run = useCallback(
    async (session: Session, action: SessionAction, reason?: string): Promise<Session | null> => {
      setPendingAction(action);
      setError(null);
      try {
        const updated = await services.sessions.updateStatus(
          session.id,
          STATUS_FOR_ACTION[action],
          reason,
        );
        onUpdated?.(updated);
        return updated;
      } catch (caught) {
        const appError = toAppError(caught);
        setError(appError);
        return null;
      } finally {
        setPendingAction(null);
      }
    },
    [onUpdated],
  );

  const accept = useCallback((session: Session) => run(session, 'accept'), [run]);
  const reject = useCallback(
    (session: Session, reason?: string) => run(session, 'reject', reason),
    [run],
  );
  const complete = useCallback((session: Session) => run(session, 'complete'), [run]);
  const cancel = useCallback(
    (session: Session, reason?: string) => run(session, 'cancel', reason),
    [run],
  );

  return { pendingAction, error, accept, reject, complete, cancel, clearError: () => setError(null) };
}
