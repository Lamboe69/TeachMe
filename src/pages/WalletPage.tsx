import { useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, Banknote, CheckCircle2, Clock, Download,
  Info, Plus, Receipt, Search, Shield, Smartphone, Wallet as WalletIcon,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { PLATFORM_FEE_PERCENT } from '@/app/config';
import { toAppError } from '@/utils/apiError';
import { formatRelative, formatUGX } from '@/utils/format';
import type { MobileMoneyNetwork, WalletTransaction } from '@/types';

type Mode = 'topup' | 'withdraw' | null;
const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

const TXN_META: Record<WalletTransaction['type'], { label: string; icon: typeof ArrowDownLeft; positive: boolean }> = {
  TOP_UP:          { label: 'Wallet top-up',    icon: ArrowDownLeft, positive: true  },
  WITHDRAWAL:      { label: 'Withdrawal',        icon: ArrowUpRight,  positive: false },
  SESSION_PAYMENT: { label: 'Session payment',   icon: Clock,         positive: false },
  SESSION_EARNING: { label: 'Session earnings',  icon: Banknote,      positive: true  },
  REFUND:          { label: 'Refund',            icon: ArrowDownLeft, positive: true  },
};

function formatTxnDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function txnTime(value: string | null): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

const TXN_TABS: Array<{ id: 'ALL' | WalletTransaction['type']; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'TOP_UP', label: 'Top-ups' },
  { id: 'SESSION_PAYMENT', label: 'Payments' },
  { id: 'REFUND', label: 'Refunds' },
  { id: 'SESSION_EARNING', label: 'Earnings' },
  { id: 'WITHDRAWAL', label: 'Withdrawals' },
];

const cardStyle = { background: 'rgba(21,88,201,0.08)', border: '1px solid rgba(21,88,201,0.25)' };
const inputClass = 'h-12 w-full rounded-xl px-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(21,88,201,0.4)' };

export function WalletPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isTutor = user?.role === 'TUTOR';

  const state = useAsyncData(
    () => Promise.all([services.wallet.getWallet(), services.wallet.listTransactions()]),
    [],
  );
  const wallet = state.data?.[0] ?? null;
  const transactions = useMemo(() => state.data?.[1] ?? [], [state.data]);

  const [mode, setMode] = useState<Mode>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [network, setNetwork] = useState<MobileMoneyNetwork>('MTN');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const totalIn  = useMemo(() => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalOut = useMemo(() => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);

  const [txnTab, setTxnTab] = useState<'ALL' | WalletTransaction['type']>('ALL');
  const [txnSearch, setTxnSearch] = useState('');
  const [txnSort, setTxnSort] = useState('newest');

  const txnCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: transactions.length };
    transactions.forEach((t) => { counts[t.type] = (counts[t.type] ?? 0) + 1; });
    return counts;
  }, [transactions]);

  const visibleTxns = useMemo(() => {
    const byType = txnTab === 'ALL' ? transactions : transactions.filter((t) => t.type === txnTab);
    const needle = txnSearch.trim().toLowerCase();
    const searched = needle
      ? byType.filter((t) => `${TXN_META[t.type]?.label ?? ''} ${t.description} ${t.reference ?? ''}`.toLowerCase().includes(needle))
      : byType;
    return [...searched].sort((a, b) => (txnSort === 'oldest'
      ? txnTime(a.createdAt) - txnTime(b.createdAt)
      : txnTime(b.createdAt) - txnTime(a.createdAt)));
  }, [transactions, txnTab, txnSearch, txnSort]);

  function exportStatement() {
    const header = ['Date', 'Type', 'Description', 'Reference', 'Amount (UGX)', 'Balance after (UGX)'];
    const rows = transactions.map((t) => [
      t.createdAt ?? '',
      TXN_META[t.type]?.label ?? t.type,
      t.description,
      t.reference ?? '',
      String(t.amount),
      String(t.balanceAfter),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tutorug-statement.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function openModal(next: Exclude<Mode, null>) {
    setMode(next); setAmount(''); setPhone(user?.phone ?? ''); setNetwork('MTN'); setFormError(null);
  }
  function closeModal() { if (submitting) return; setMode(null); }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const numeric = Math.round(Number(amount.replace(/[^\d.]/g, '')));
    if (!Number.isFinite(numeric) || numeric < 1000) { setFormError('Enter an amount of at least UGX 1,000.'); return; }
    if (mode === 'withdraw' && wallet && numeric > wallet.availableBalance) { setFormError('You cannot withdraw more than your available balance.'); return; }
    setSubmitting(true);
    try {
      const payload = { amount: numeric, phone, network };
      if (mode === 'topup') {
        await services.wallet.topUp(payload);
        toast.success('Wallet topped up', `${formatUGX(numeric)} added via ${network === 'AIRTEL' ? 'Airtel Money' : 'MTN MoMo'}.`);
      } else {
        await services.wallet.withdraw(payload);
        toast.success('Withdrawal sent', `${formatUGX(numeric)} is on its way to your mobile money.`);
      }
      setMode(null); state.reload();
    } catch (error) {
      const appError = toAppError(error);
      setFormError(appError.message);
      toast.error('Something went wrong', appError.message);
    } finally { setSubmitting(false); }
  }

  return (
    <AppShell title="Wallet">
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold" style={{ color: '#D4FF24' }}>Mobile Money</p>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">My wallet</h2>
        <p className="mt-2 text-white/55">
          {isTutor ? 'Receive session earnings and withdraw to your mobile money.' : 'Top up once, then pay for sessions instantly from your balance.'}
        </p>
      </div>

      {state.error ? (
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)' }}>
          <p className="font-semibold text-white">We could not load your wallet</p>
          <p className="mt-1 text-sm text-white/60">{state.error.message}</p>
          <button onClick={state.reload} className="mt-4 rounded-xl px-4 py-2 text-sm font-bold" style={{ background: '#D4FF24', color: '#030407' }}>Try again</button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Balance card */}
            <div className="relative min-w-0 overflow-hidden rounded-3xl p-5 sm:p-7 lg:col-span-2" style={{ background: 'linear-gradient(135deg, #1558C9 0%, #0d3d8a 60%, #030407 100%)' }}>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full" style={{ background: 'rgba(212,255,36,0.08)' }} />
              <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
                  <WalletIcon className="h-4 w-4" /> Available balance
                </div>
                <p className="mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {state.loading ? 'UGX —' : formatUGX(wallet?.availableBalance ?? 0)}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  {isTutor ? 'Withdraw your earnings, or top up to book sessions.' : 'Use this balance to pay for tutoring sessions.'}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={() => openModal('topup')} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90" style={{ background: '#D4FF24', color: '#030407' }}>
                    <Plus className="h-4 w-4" /> Top up
                  </button>
                  <button onClick={() => openModal('withdraw')} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10" style={{ border: '2px solid rgba(255,255,255,0.4)' }}>
                    <ArrowUpRight className="h-4 w-4" /> Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Side stats */}
            <div className="min-w-0 space-y-4">
              <div className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/50">{isTutor ? 'Pending earnings' : 'Held in escrow'}</p>
                  <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: 'rgba(212,255,36,0.12)' }}>
                    <Clock className="h-4 w-4" style={{ color: '#D4FF24' }} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black text-white">{state.loading ? 'UGX —' : formatUGX(wallet?.escrowBalance ?? 0)}</p>
                <p className="mt-1 text-xs text-white/40">
                  {isTutor ? `Released after each session, less the ${PLATFORM_FEE_PERCENT}% TutorUG fee.` : 'Returned if a session is cancelled or declined.'}
                </p>
              </div>

              <div className="rounded-2xl p-5" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/50">Lifetime flow</p>
                  <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: 'rgba(21,88,201,0.25)' }}>
                    <Receipt className="h-4 w-4" style={{ color: '#1558C9' }} />
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Money in</span>
                    <span className="font-bold" style={{ color: '#D4FF24' }}>+{formatUGX(totalIn)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Money out</span>
                    <span className="font-bold text-white">−{formatUGX(totalOut)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How it works + MoMo */}
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl p-5 sm:p-6 lg:col-span-2" style={{ background: 'rgba(212,255,36,0.05)', border: '1px solid rgba(212,255,36,0.15)' }}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(212,255,36,0.12)' }}>
                  <Shield className="h-5 w-5" style={{ color: '#D4FF24' }} />
                </div>
                <div>
                  <p className="font-bold text-white">How TutorUG protects your money</p>
                  <ul className="mt-3 space-y-2 text-sm text-white/60">
                    {[
                      isTutor ? 'Earnings are held until you mark a session complete, then land in your wallet.' : 'Your payment is held in escrow — the tutor is only paid after the session.',
                      isTutor ? `Withdraw anytime to MTN MoMo or Airtel Money. A ${PLATFORM_FEE_PERCENT}% service fee is already deducted.` : 'Changed your mind? Cancel before the session and the fee returns to your wallet instantly.',
                      isTutor ? 'You can also learn from other tutors — top up and book using this same wallet.' : 'Withdraw your available balance back to MTN MoMo or Airtel Money at any time.',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#D4FF24' }} />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 mb-3">Mobile money</p>
              <div className="space-y-3">
                {[
                  { label: 'MTN MoMo', sub: 'Top up & withdraw', color: '#f59e0b' },
                  { label: 'Airtel Money', sub: 'Top up & withdraw', color: '#ef4444' },
                ].map(({ label, sub, color }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${color}20` }}>
                      <Smartphone className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-xs text-white/40">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-white/30">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                No card needed. Standard mobile money charges may apply.
              </p>
            </div>
          </div>

          {/* Transactions */}
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Transactions</h3>
                <p aria-live="polite" className="text-sm text-white/40">
                  {visibleTxns.length} of {transactions.length} shown
                </p>
              </div>
              {transactions.length > 0 && (
                <button
                  type="button"
                  onClick={exportStatement}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  style={{ border: '1px solid rgba(21,88,201,0.4)' }}
                >
                  <Download className="h-4 w-4" /> Download statement
                </button>
              )}
            </div>

            {transactions.length > 0 && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      type="search"
                      value={txnSearch}
                      onChange={(e) => setTxnSearch(e.target.value)}
                      placeholder="Search transactions…"
                      aria-label="Search transactions"
                      className="h-11 w-full rounded-xl pl-10 pr-4 text-sm font-medium text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-[#1558C9]"
                      style={inputStyle}
                    />
                  </div>
                  <select
                    aria-label="Sort transactions"
                    value={txnSort}
                    onChange={(e) => setTxnSort(e.target.value)}
                    className="h-11 rounded-xl px-4 text-sm font-semibold text-white outline-none transition focus:ring-2 focus:ring-[#1558C9] sm:w-44"
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>

                <div role="tablist" aria-label="Filter transactions by type" className="mb-4 flex flex-wrap gap-2">
                  {TXN_TABS.map((tab) => {
                    const count = txnCounts[tab.id] ?? 0;
                    const selected = txnTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setTxnTab(tab.id)}
                        disabled={count === 0 && tab.id !== 'ALL'}
                        className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-30"
                        style={selected
                          ? { background: '#D4FF24', color: '#030407' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(21,88,201,0.35)', color: 'rgba(255,255,255,0.6)' }
                        }
                      >
                        {tab.label}
                        <span className="rounded-full px-1.5 py-0.5 text-xs" style={selected ? { background: 'rgba(3,4,7,0.2)', color: '#030407' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {state.loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl" style={cardStyle} />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={cardStyle}>
                <Receipt className="mx-auto h-12 w-12 text-white/20" />
                <p className="mt-4 font-semibold text-white">No transactions yet</p>
                <p className="mt-1 text-sm text-white/50">
                  {isTutor ? 'Complete sessions to earn. Transactions will appear here.' : 'Top up your wallet to start booking sessions.'}
                </p>
              </div>
            ) : visibleTxns.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={cardStyle}>
                <Search className="mx-auto h-12 w-12 text-white/20" />
                <p className="mt-4 font-semibold text-white">No matching transactions</p>
                <p className="mt-1 text-sm text-white/50">Try a different search term or filter.</p>
                <button
                  type="button"
                  onClick={() => { setTxnSearch(''); setTxnTab('ALL'); }}
                  className="mt-5 rounded-xl px-6 py-2 text-sm font-semibold transition hover:opacity-80"
                  style={{ background: 'rgba(21,88,201,0.3)', border: '1px solid rgba(21,88,201,0.5)', color: 'white' }}
                >
                  Show all transactions
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl" style={cardStyle}>
                <ul>
                  {visibleTxns.map((txn, idx) => {
                    const meta = TXN_META[txn.type] ?? TXN_META.TOP_UP;
                    const Icon = meta.icon;
                    const positive = txn.amount > 0;
                    const relative = formatRelative(txn.createdAt);
                    return (
                      <li key={txn.id} className="flex items-center gap-4 p-5" style={idx > 0 ? { borderTop: '1px solid rgba(21,88,201,0.15)' } : {}}>
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: positive ? 'rgba(212,255,36,0.12)' : 'rgba(21,88,201,0.2)' }}>
                          <Icon className="h-5 w-5" style={{ color: positive ? '#D4FF24' : '#7eb3ff' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-white text-sm">{meta.label}</p>
                          <p className="truncate text-xs text-white/50">{txn.description}</p>
                          <p className="mt-0.5 text-xs text-white/30">
                            {formatTxnDate(txn.createdAt)}
                            {relative ? ` · ${relative}` : ''}
                            {txn.reference ? ` · ${txn.reference}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm" style={{ color: positive ? '#D4FF24' : 'white' }}>
                            {positive ? '+' : '−'}{formatUGX(Math.abs(txn.amount))}
                          </p>
                          <p className="text-xs text-white/30">{formatUGX(txn.balanceAfter)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal */}
      <Dialog
        open={mode !== null}
        onClose={closeModal}
        title={mode === 'topup' ? 'Top up your wallet' : 'Withdraw to mobile money'}
        description={mode === 'topup' ? 'Add money from MTN MoMo or Airtel Money to pay for sessions.' : 'Send your available balance back to your mobile money account.'}
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={closeModal} disabled={submitting} className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white/70 transition hover:text-white disabled:opacity-50" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              Cancel
            </button>
            <button type="submit" form="wallet-form" disabled={submitting} className="flex-1 rounded-xl px-4 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-60" style={{ background: '#D4FF24', color: '#030407' }}>
              {submitting ? (mode === 'topup' ? 'Adding…' : 'Sending…') : (mode === 'topup' ? 'Add money' : 'Withdraw')}
            </button>
          </div>
        }
      >
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="wallet-amount" className="mb-1.5 block text-sm font-semibold text-white/80">Amount (UGX)</label>
            <input
              id="wallet-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="10,000"
              className="h-14 w-full rounded-xl px-4 text-2xl font-black text-white outline-none transition focus:ring-2 focus:ring-[#1558C9]"
              style={inputStyle}
              autoFocus
            />
            {mode === 'withdraw' && wallet && (
              <p className="mt-1 text-xs text-white/40">Available: {formatUGX(wallet.availableBalance)}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button key={value} type="button" onClick={() => setAmount(String(value))} className="rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ background: 'rgba(21,88,201,0.25)', border: '1px solid rgba(21,88,201,0.4)', color: 'white' }}>
                  {formatUGX(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-white/80">Mobile money network</span>
            <div className="grid grid-cols-2 gap-3">
              {(['MTN', 'AIRTEL'] as const).map((option) => {
                const isMtn = option === 'MTN';
                const accent = isMtn ? '#f59e0b' : '#ef4444';
                const selected = network === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setNetwork(option)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition"
                    style={selected
                      ? { background: `${accent}18`, border: `2px solid ${accent}`, color: 'white' }
                      : { background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: selected ? `${accent}25` : 'rgba(255,255,255,0.06)' }}>
                      <Smartphone className="h-4 w-4" style={{ color: selected ? accent : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    {isMtn ? 'MTN MoMo' : 'Airtel Money'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="wallet-phone" className="mb-1.5 block text-sm font-semibold text-white/80">Mobile money number</label>
            <input id="wallet-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 7XX XXX XXX" className={inputClass} style={inputStyle} />
            <p className="mt-1 text-xs text-white/30">
              {mode === 'topup' ? 'You will get a prompt on this number to approve the payment.' : 'Funds are sent to this mobile money number.'}
            </p>
          </div>

          {formError && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', color: '#ff8080' }}>
              {formError}
            </div>
          )}

          <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(212,255,36,0.06)', border: '1px solid rgba(212,255,36,0.15)', color: 'rgba(212,255,36,0.7)' }}>
            <p className="flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Demo mode: the {mode === 'topup' ? 'top-up' : 'withdrawal'} is simulated instantly. No real money moves.
            </p>
          </div>
        </form>
      </Dialog>
    </AppShell>
  );
}
