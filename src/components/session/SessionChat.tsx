import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';

export function SessionChat({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, setData } = useAsyncData(
    () => services.sessions.listMessages(sessionId),
    [sessionId],
  );
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messages = data ?? [];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;

    setSending(true);
    setSendError(null);
    try {
      const message = await services.sessions.sendMessage(sessionId, text);
      setData([...messages, message]);
      setBody('');
    } catch (caught) {
      const appError = toAppError(caught);
      setSendError(appError.message);
      toast.error('Message not sent', appError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-brand-600" aria-hidden="true" />
        <h2 className="text-lg font-bold text-ink-900">Chat</h2>
      </div>
      <p className="mt-1 text-sm text-ink-600">
        You can message each other now that the session fee has been paid. Keep arrangements in
        this chat so both sides have a record.
      </p>

      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-ink-50 p-4">
        {loading ? (
          <p className="text-sm text-ink-500">Loading messages…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error.message}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-ink-500">
            No messages yet. Say hello and confirm where you will meet.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === user?.id;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-ink-800 ring-1 ring-ink-200'
                  }`}
                >
                  <p className={`text-xs font-semibold ${mine ? 'text-white/75' : 'text-ink-500'}`}>
                    {mine ? 'You' : message.senderName}
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words">{message.body}</p>
                  {message.createdAt ? (
                    <p className={`mt-1 text-[11px] ${mine ? 'text-white/60' : 'text-ink-400'}`}>
                      {new Date(message.createdAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <div className="flex gap-2">
          <textarea
            id="chat-message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Write a message…"
            className="min-h-12 flex-1 resize-none rounded-xl border border-ink-300 px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <Button type="submit" loading={sending} disabled={!body.trim()} leftIcon={Send} className="self-end">
            Send
          </Button>
        </div>
        {sendError ? <p className="mt-2 text-sm text-red-600">{sendError}</p> : null}
      </form>
    </Card>
  );
}
