import { useMemo, useState } from 'react';
import { CalendarX2, Filter } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { TabPanel, Tabs } from '@/components/ui/Tabs';
import { SessionActions } from '@/components/session/SessionActions';
import { SessionCard } from '@/components/session/SessionCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import type { Session, SessionStatus } from '@/types';

const TAB_ORDER: Array<{ value: string; label: string; statuses: SessionStatus[] }> = [
  { value: 'ALL', label: 'All', statuses: [] },
  { value: 'REQUESTED', label: 'Requested', statuses: ['REQUESTED'] },
  { value: 'ACCEPTED', label: 'Accepted', statuses: ['ACCEPTED'] },
  { value: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { value: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED'] },
  { value: 'REJECTED', label: 'Rejected', statuses: ['REJECTED'] },
];

export function SessionsPage() {
  const { user } = useAuth();
  const { data, error, loading, reload, setData } = useAsyncData(
    () => services.sessions.listMine(),
    [],
  );
  const [tab, setTab] = useState('ALL');

  const sessions = useMemo(() => data ?? [], [data]);
  const perspective = user?.role === 'TUTOR' ? 'tutor' : 'student';

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
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Sessions"
        title="My sessions"
        description={
          perspective === 'tutor'
            ? 'Every booking request and confirmed lesson connected to your teaching.'
            : 'Track the tutoring sessions you have requested, confirmed and completed.'
        }
        actions={
          perspective === 'student' ? (
            <ButtonLink to="/tutors" variant="outline">
              Find a tutor
            </ButtonLink>
          ) : undefined
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
          <TabPanel id="sessions-panel" active>
            {visible.length === 0 ? (
              <EmptyState
                icon={<CalendarX2 className="h-10 w-10" aria-hidden="true" />}
                title={
                  tab === 'ALL'
                    ? 'No sessions yet'
                    : `No ${tab.toLowerCase()} sessions`
                }
                description={
                  tab === 'ALL'
                    ? perspective === 'student'
                      ? 'Browse the tutor directory and request your first session — it takes about a minute.'
                      : 'When a student requests a lesson from you, it will appear here.'
                    : 'Try another tab to see your other sessions.'
                }
                action={
                  tab === 'ALL' && perspective === 'student' ? (
                    <ButtonLink to="/tutors">Browse tutors</ButtonLink>
                  ) : (
                    <Button variant="outline" leftIcon={Filter} onClick={() => setTab('ALL')}>
                      Show all sessions
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="space-y-4">
                {visible.map((session) => (
                  <li key={session.id}>
                    <SessionCard
                      session={session}
                      perspective={perspective}
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
  );
}
