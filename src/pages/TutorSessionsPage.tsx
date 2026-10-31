import { useMemo, useState } from 'react';
import { CalendarX2, Inbox } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { AppShell } from '@/components/layout/AppShell';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { TabPanel, Tabs } from '@/components/ui/Tabs';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionCard } from '@/components/session/SessionCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import type { Session, SessionStatus } from '@/types';

const TAB_ORDER: Array<{ value: string; label: string; statuses: SessionStatus[] }> = [
  { value: 'ALL', label: 'All', statuses: [] },
  { value: 'REQUESTED', label: 'Requests', statuses: ['REQUESTED'] },
  { value: 'ACCEPTED', label: 'Confirmed', statuses: ['ACCEPTED'] },
  { value: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { value: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED'] },
  { value: 'REJECTED', label: 'Declined', statuses: ['REJECTED'] },
];

export function TutorSessionsPage() {
  const { data, error, loading, reload, setData } = useAsyncData(
    () => services.sessions.listMine(),
    [],
  );
  const [tab, setTab] = useState('REQUESTED');

  const sessions = useMemo(() => data ?? [], [data]);

  const tabs = useMemo(
    () =>
      TAB_ORDER.map((entry) => ({
        value: entry.value,
        label: entry.label,
        count:
          entry.statuses.length === 0
            ? sessions.length
            : sessions.filter((session) => entry.statuses.includes(session.status)).length,
      })),
    [sessions],
  );

  const visible = useMemo(() => {
    const entry = TAB_ORDER.find((item) => item.value === tab);
    if (!entry || entry.statuses.length === 0) return sessions;
    return sessions.filter((session) => entry.statuses.includes(session.status));
  }, [sessions, tab]);

  const handleUpdated = (updated: Session) => {
    setData((current) =>
      (current ?? []).map((session) => (session.id === updated.id ? updated : session)),
    );
  };

  return (
    <AppShell title="Session requests">
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Tutor sessions"
        title="Manage your sessions"
        description="Accept or decline booking requests, mark lessons as completed and keep your teaching calendar up to date."
        actions={
          <ButtonLink to="/tutor/dashboard" variant="outline">
            Back to dashboard
          </ButtonLink>
        }
      />

      <div className="mt-8">
        <Tabs items={tabs} value={tab} onChange={setTab} ariaLabel="Filter sessions by status" />
      </div>

      <div className="mt-6">
        {error ? (
          <Alert
            tone="error"
            title="We could not load your sessions"
            action={
              <Button variant="outline" size="sm" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error.message}
          </Alert>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-card" />
            ))}
          </div>
        ) : null}

        {!loading && !error ? (
          <TabPanel id="tutor-sessions-panel" active>
            {visible.length === 0 ? (
              <EmptyState
                icon={tab === 'REQUESTED' ? <Inbox className="h-10 w-10" aria-hidden="true" /> : <CalendarX2 className="h-10 w-10" aria-hidden="true" />}
                title={
                  tab === 'REQUESTED'
                    ? 'No booking requests waiting'
                    : tab === 'ALL'
                      ? 'No sessions yet'
                      : `No ${tab.toLowerCase()} sessions`
                }
                description={
                  tab === 'REQUESTED'
                    ? 'New requests from students appear here. Accept one to confirm the lesson.'
                    : tab === 'ALL'
                      ? 'Sessions will appear here once students start booking lessons with you.'
                      : 'Try another tab to see your other sessions.'
                }
                action={
                  tab !== 'ALL' ? (
                    <Button variant="outline" onClick={() => setTab('ALL')}>
                      Show all sessions
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="space-y-4">
                {visible.map((session) => (
                  <li key={session.id}>
                    <SessionCard
                      session={session}
                      perspective="tutor"
                      actions={
                        <SessionActions session={session} onUpdated={handleUpdated} compact />
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>
        ) : null}
      </div>
    </div>
    </AppShell>
  );
}
