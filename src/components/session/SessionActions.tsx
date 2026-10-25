import { useState } from 'react';
import { Check, CheckCircle2, Star, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSessionMutations } from '@/hooks/useSessionMutations';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import type { Session } from '@/types';
import { getSessionActions } from '@/utils/sessionPermissions';

type PendingKind = 'reject' | 'complete' | 'cancel' | null;

/**
 * The actions the backend permits for a session.
 *
 * Every action calls the API first; the UI is only updated once the server
 * has confirmed the new state. The backend remains the authority — if it
 * refuses an action we show the returned error.
 */
export function SessionActions({
  session,
  onUpdated,
  compact = false,
}: {
  session: Session;
  onUpdated: (session: Session) => void;
  compact?: boolean;
}) {
  const toast = useToast();
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingKind>(null);
  const { pendingAction, accept, reject, complete, cancel } = useSessionMutations(onUpdated);

  const actions = getSessionActions(session, user);
  const size = compact ? 'sm' : 'md';
  const busy = pendingAction !== null;

  const handleAccept = async () => {
    const updated = await accept(session);
    if (updated) {
      toast.success('Booking accepted', 'The student has been notified.');
    }
  };

  const handleReject = async () => {
    const updated = await reject(session);
    setPending(null);
    if (updated) {
      toast.success('Request declined', 'The student has been notified.');
    }
  };

  const handleComplete = async () => {
    const updated = await complete(session);
    setPending(null);
    if (updated) {
      toast.success('Session marked as completed', 'The student can now leave a review.');
    }
  };

  const handleCancel = async () => {
    const updated = await cancel(session);
    setPending(null);
    if (updated) {
      toast.success('Session cancelled');
    }
  };

  return (
    <>
      <div data-testid="session-actions" className="flex flex-wrap gap-2">
        {actions.canAccept ? (
          <Button
            size={size}
            variant="success"
            leftIcon={Check}
            loading={pendingAction === 'accept'}
            disabled={busy}
            onClick={handleAccept}
          >
            Accept
          </Button>
        ) : null}

        {actions.canReject ? (
          <Button
            size={size}
            variant="outline"
            leftIcon={X}
            disabled={busy}
            onClick={() => setPending('reject')}
          >
            Decline
          </Button>
        ) : null}

        {actions.canComplete ? (
          <Button
            size={size}
            variant="success"
            leftIcon={CheckCircle2}
            loading={pendingAction === 'complete'}
            disabled={busy}
            onClick={() => setPending('complete')}
          >
            Mark completed
          </Button>
        ) : null}

        {actions.canReview ? (
          <ButtonLink to={`/sessions/${session.id}/feedback`} size={size} variant="primary" leftIcon={Star}>
            Leave a review
          </ButtonLink>
        ) : null}

        {actions.canCancel ? (
          <Button size={size} variant="ghost" disabled={busy} onClick={() => setPending('cancel')}>
            Cancel session
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={pending === 'reject'}
        title="Decline this booking request?"
        description="The student will see that you are unavailable for this time. They can send another request later."
        confirmLabel="Decline request"
        confirmVariant="danger"
        loading={pendingAction === 'reject'}
        onConfirm={handleReject}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === 'complete'}
        title="Mark this session as completed?"
        description="Only do this once the lesson has actually taken place. The student will then be able to leave a review."
        confirmLabel="Yes, mark completed"
        confirmVariant="success"
        loading={pendingAction === 'complete'}
        onConfirm={handleComplete}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === 'cancel'}
        title="Cancel this session?"
        description="Cancelling cannot be undone. Consider agreeing a new time with the other person instead."
        confirmLabel="Yes, cancel session"
        confirmVariant="danger"
        loading={pendingAction === 'cancel'}
        onConfirm={handleCancel}
        onClose={() => setPending(null)}
      />
    </>
  );
}
