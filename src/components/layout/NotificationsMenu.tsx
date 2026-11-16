import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, MessageCircle } from 'lucide-react';
import { notificationToneColor, useNotifications } from '@/hooks/useNotifications';
import { formatRelative } from '@/utils/format';
import type { Session } from '@/types';

/**
 * The notification bell. Everything here is derived from the user's sessions,
 * so it always reflects something they can act on — accept, attend, review.
 */
export function NotificationsMenu({
  sessions,
  isTutor,
}: {
  sessions: Session[];
  isTutor: boolean;
}) {
  const { notifications, unread, markAllRead } = useNotifications(sessions, isTutor);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const toggle = () => {
    setOpen((value) => {
      const next = !value;
      if (next) markAllRead();
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-white/50 transition hover:text-white"
        style={{ border: '1px solid rgba(21,88,201,0.3)' }}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-black"
            style={{ background: '#D4FF24', color: '#030407' }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: '#0d1526', border: '1px solid rgba(21,88,201,0.4)' }}
          role="menu"
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(21,88,201,0.25)' }}
          >
            <p className="text-sm font-bold text-white">Notifications</p>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 transition hover:text-white"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-white/20" />
                <p className="mt-2 text-sm font-semibold text-white">You are all caught up</p>
                <p className="mt-0.5 text-xs text-white/40">New updates will appear here.</p>
              </div>
            ) : (
              notifications.map((item, index) => {
                const color = notificationToneColor(item.tone);
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-white/5"
                    style={index > 0 ? { borderTop: '1px solid rgba(21,88,201,0.12)' } : {}}
                  >
                    <span
                      className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                      style={{ background: `${color}22` }}
                    >
                      <item.icon className="h-4 w-4" style={{ color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{item.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/50">{item.body}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-white/35">
                      {formatRelative(new Date(item.at).toISOString())}
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            to="/sessions"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5"
            style={{ borderTop: '1px solid rgba(21,88,201,0.25)', color: '#D4FF24' }}
          >
            <MessageCircle className="h-4 w-4" /> Open messages
          </Link>
        </div>
      )}
    </div>
  );
}
