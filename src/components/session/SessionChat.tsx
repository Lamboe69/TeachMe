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
        <MessageSquare className="h-5 w-5 text-volt-400" aria-hidden="true" />
        <h2 className="text-lg font-bold text-white">Chat</h2>
      </div>
      <p className="mt-1 text-sm text-white/60">
        You can message each other now that the session fee has been paid. Keep arrangements in
        this chat so both sides have a record.
      </p>

      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-white/[0.04] p-4">
        {loading ? (
          <p className="text-sm text-white/45">Loading messages…</p>
        ) : error ? (
          <p className="text-sm text-red-300">{error.message}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-white/45">
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
                      ? 'bg-cobalt-500 text-white'
                      : 'bg-white/[0.06] text-white/85 ring-1 ring-white/10'
                  }`}
                >
                  <p className={`text-xs font-semibold ${mine ? 'text-white/75' : 'text-white/45'}`}>
                    {mine ? 'You' : message.senderName}
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words">{message.body}</p>
                  {message.createdAt ? (
                    <p className={`mt-1 text-[11px] ${mine ? 'text-white/60' : 'text-white/35'}`}>
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
            className="min-h-12 flex-1 resize-none rounded-xl border border-[rgba(21,88,201,0.4)] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-cobalt-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500/25"
          />
          <Button type="submit" loading={sending} disabled={!body.trim()} leftIcon={Send} className="self-end">
            Send
          </Button>
        </div>
        {sendError ? <p className="mt-2 text-sm text-red-300">{sendError}</p> : null}
      </form>
    </Card>
  );
}
