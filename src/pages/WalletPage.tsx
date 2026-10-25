import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Home,
  Info,
  Landmark,
  Plus,
  Receipt,
  Search,
  Shield,
  Smartphone,
  User,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { services } from '@/services';
import { PLATFORM_FEE_PERCENT } from '@/app/config';
import { toAppError } from '@/utils/apiError';
import { formatUGX } from '@/utils/format';
import type { MobileMoneyNetwork, WalletTransaction } from '@/types';

type Mode = 'topup' | 'withdraw' | null;

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

const TXN_META: Record<
  WalletTransaction['type'],
  { label: string; icon: typeof ArrowDownLeft; tone: string }
> = {
  TOP_UP: { label: 'Wallet top-up', icon: ArrowDownLeft, tone: 'bg-green-100 text-green-700' },
  WITHDRAWAL: { label: 'Withdrawal', icon: ArrowUpRight, tone: 'bg-amber-100 text-amber-700' },
  SESSION_PAYMENT: { label: 'Session payment', icon: Clock, tone: 'bg-amber-100 text-amber-700' },
  SESSION_EARNING: { label: 'Session earnings', icon: Banknote, tone: 'bg-green-100 text-green-700' },
  REFUND: { label: 'Refund', icon: ArrowDownLeft, tone: 'bg-blue-100 text-blue-700' },
};

function formatTxnDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

  const totalIn = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );
  const totalOut = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
  );

  function openModal(next: Exclude<Mode, null>) {
    setMode(next);
    setAmount('');
    setPhone(user?.phone ?? '');
    setNetwork('MTN');
    setFormError(null);
  }

  function closeModal() {
    if (submitting) return;
    setMode(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const numeric = Math.round(Number(amount.replace(/[^\d.]/g, '')));
    if (!Number.isFinite(numeric) || numeric < 1000) {
      setFormError('Enter an amount of at least UGX 1,000.');
      return;
    }
    if (mode === 'withdraw' && wallet && numeric > wallet.availableBalance) {
      setFormError('You cannot withdraw more than your available balance.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { amount: numeric, phone, network };
      if (mode === 'topup') {
        await services.wallet.topUp(payload);
        toast.success('Wallet topped up', `${formatUGX(numeric)} added via ${
          network === 'AIRTEL' ? 'Airtel Money' : 'MTN MoMo'
        }.`);
      } else {
        await services.wallet.withdraw(payload);
        toast.success('Withdrawal sent', `${formatUGX(numeric)} is on its way to your mobile money.`);
      }
      setMode(null);
      state.reload();
    } catch (error) {
      const appError = toAppError(error);
      setFormError(appError.message);
      toast.error('Something went wrong', appError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-green-100">
          <div className="flex h-20 items-center px-6 border-b border-green-100">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-ink-950">TutorUG</span>
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            <Link
              to={isTutor ? '/tutor/dashboard' : '/student/dashboard'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/tutors"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Search className="h-5 w-5" />
              Find tutors
            </Link>
            <Link
              to="/sessions"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <Calendar className="h-5 w-5" />
              Sessions
            </Link>
            <Link
              to="/wallet"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold"
            >
              <WalletIcon className="h-5 w-5" />
              Wallet
            </Link>
            <Link
              to={isTutor ? '/tutor/profile/edit' : '/student/profile'}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-700 hover:bg-green-50 hover:text-green-700 transition"
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
          </nav>
          <div className="p-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 ring-1 ring-amber-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-700" />
                <p className="text-xs font-bold text-amber-900">Escrow protected</p>
              </div>
              <p className="mt-1 text-xs text-amber-800">
                Your money is held by TutorUG until a session is complete.
              </p>
            </div>
          </div>
        </aside>

        <div className="lg:pl-72 w-full">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-green-100">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-ink-950">Wallet</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-green-50 px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-sm font-bold text-white">
                    {user?.fullName?.charAt(0)}
                  </div>
                  <span className="hidden text-sm font-semibold text-ink-900 sm:inline">
                    {user?.fullName}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-ink-950 sm:text-4xl">
                My wallet
              </h2>
              <p className="mt-2 text-lg text-ink-700">
                {isTutor
                  ? 'Receive session earnings and withdraw to your mobile money.'
                  : 'Top up once, then pay for sessions instantly from your balance.'}
              </p>
            </div>

            {state.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                <p className="font-semibold">We could not load your wallet</p>
                <p className="mt-1 text-sm">{state.error.message}</p>
                <button
                  onClick={state.reload}
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-emerald-700 to-green-800 p-7 text-white shadow-xl lg:col-span-2">
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
                    <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-300/10" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                        <WalletIcon className="h-4 w-4" />
                        Available balance
                      </div>
                      <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                        {state.loading ? 'UGX —' : formatUGX(wallet?.availableBalance ?? 0)}
                      </p>
                      <p className="mt-2 text-sm text-white/75">
                        {isTutor
                          ? 'Ready to withdraw to your mobile money account.'
                          : 'Use this balance to pay for tutoring sessions.'}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        {!isTutor && (
                          <button
                            onClick={() => openModal('topup')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-green-800 shadow-lg transition hover:shadow-xl"
                          >
                            <Plus className="h-5 w-5" />
                            Top up
                          </button>
                        )}
                        <button
                          onClick={() => openModal('withdraw')}
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-6 py-3 font-bold text-white transition hover:bg-white/10"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink-600">
                          {isTutor ? 'Pending earnings' : 'Held in escrow'}
                        </p>
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100">
                          <Clock className="h-4.5 w-4.5 text-amber-700" />
                        </div>
                      </div>
                      <p className="mt-2 text-2xl font-black text-ink-950">
                        {state.loading ? 'UGX —' : formatUGX(wallet?.escrowBalance ?? 0)}
                      </p>
                      <p className="mt-1 text-xs text-ink-600">
                        {isTutor
                          ? `Released after each session, less the ${PLATFORM_FEE_PERCENT}% TutorUG fee.`
                          : 'Returned automatically if a session is cancelled or declined.'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink-600">Lifetime flow</p>
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-green-100">
                          <Receipt className="h-4.5 w-4.5 text-green-700" />
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-600">Money in</span>
                          <span className="font-bold text-green-700">+{formatUGX(totalIn)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-600">Money out</span>
                          <span className="font-bold text-ink-900">−{formatUGX(totalOut)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 ring-1 ring-green-200 lg:col-span-2">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow">
                        <Shield className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900">How TutorUG protects your money</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-green-900/85">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                            {isTutor
                              ? 'Earnings are held until you mark a session complete, then land in your wallet.'
                              : 'Your payment is held in escrow — the tutor is only paid after the session.'}
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                            {isTutor
                              ? `Withdraw anytime to MTN MoMo or Airtel Money. A ${PLATFORM_FEE_PERCENT}% service fee is already deducted.`
                              : 'Changed your mind? Cancel before the session and the fee returns to your wallet instantly.'}
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                            Withdraw your available balance back to MTN MoMo or Airtel Money at any time.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-green-200">
                    <p className="text-sm font-semibold text-ink-600">Mobile money</p>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-3 rounded-xl border border-ink-200 p-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100">
                          <Smartphone className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-950">MTN MoMo</p>
                          <p className="text-xs text-ink-500">Top up & withdraw</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-ink-200 p-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-100">
                          <Smartphone className="h-5 w-5 text-red-700" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink-950">Airtel Money</p>
                          <p className="text-xs text-ink-500">Top up & withdraw</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-500">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      No card needed. Standard mobile money charges may apply.
                    </p>
                  </div>
                </div>

                <section className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-ink-950">Transactions</h3>
                    <span className="text-sm text-ink-600">{transactions.length} total</span>
                  </div>

                  {state.loading ? (
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-green-200" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-green-200">
                      <Receipt className="mx-auto h-12 w-12 text-ink-400" />
                      <p className="mt-4 font-semibold text-ink-900">No transactions yet</p>
                      <p className="mt-1 text-sm text-ink-600">
                        {isTutor
                          ? 'Earnings from completed sessions will appear here.'
                          : 'Top up your wallet to start booking sessions.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-green-200">
                      <ul className="divide-y divide-green-100">
                        {transactions.map((txn) => {
                          const meta = TXN_META[txn.type] ?? TXN_META.TOP_UP;
                          const Icon = meta.icon;
                          const positive = txn.amount > 0;
                          return (
                            <li key={txn.id} className="flex items-center gap-4 p-5">
                              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-ink-950">{meta.label}</p>
                                <p className="truncate text-sm text-ink-600">{txn.description}</p>
                                <p className="mt-0.5 text-xs text-ink-500">
                                  {formatTxnDate(txn.createdAt)}
                                  {txn.reference ? ` · ${txn.reference}` : ''}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-black ${positive ? 'text-green-700' : 'text-ink-950'}`}>
                                  {positive ? '+' : '−'}
                                  {formatUGX(Math.abs(txn.amount))}
                                </p>
                                <p className="text-xs text-ink-500">
                                  {formatUGX(txn.balanceAfter)}
                                </p>
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
          </main>
        </div>
      </div>

      <Dialog
        open={mode !== null}
        onClose={closeModal}
        title={mode === 'topup' ? 'Top up your wallet' : 'Withdraw to mobile money'}
        description={
          mode === 'topup'
            ? 'Add money from MTN MoMo or Airtel Money to pay for sessions.'
            : 'Send your available balance back to your mobile money account.'
        }
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="flex-1 rounded-xl border-2 border-ink-300 px-4 py-3 font-bold text-ink-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="wallet-form"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-bold text-white shadow-lg disabled:opacity-60"
            >
              {submitting
                ? mode === 'topup'
                  ? 'Adding money…'
                  : 'Sending…'
                : mode === 'topup'
                  ? 'Add money'
                  : 'Withdraw'}
            </button>
          </div>
        }
      >
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="wallet-amount" className="mb-2 block text-sm font-semibold text-ink-900">
              Amount (UGX)
            </label>
            <input
              id="wallet-amount"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
              placeholder="50,000"
              className="h-14 w-full rounded-xl border border-ink-300 px-4 text-2xl font-black text-ink-950 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              autoFocus
            />
            {mode === 'withdraw' && wallet && (
              <p className="mt-1 text-xs text-ink-500">
                Available: {formatUGX(wallet.availableBalance)}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className="rounded-full border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-green-300 hover:bg-green-50"
                >
                  {formatUGX(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink-900">Mobile money network</span>
            <div className="grid grid-cols-2 gap-3">
              {(['MTN', 'AIRTEL'] as const).map((option) => {
                const active = network === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setNetwork(option)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-ink-200 text-ink-700 hover:border-green-300'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    {option === 'MTN' ? 'MTN MoMo' : 'Airtel Money'}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="wallet-phone" className="mb-2 block text-sm font-semibold text-ink-900">
              Mobile money number
            </label>
            <input
              id="wallet-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+256 7XX XXX XXX"
              className="h-12 w-full rounded-xl border border-ink-300 px-4 text-ink-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            />
            <p className="mt-1 text-xs text-ink-500">
              {mode === 'topup'
                ? 'You will get a prompt on this number to approve the payment.'
                : 'Funds are sent to this mobile money number.'}
            </p>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-900 ring-1 ring-amber-200">
            <p className="flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {mode === 'topup'
                ? 'Demo mode: the top-up is simulated instantly. No real money moves.'
                : 'Demo mode: the withdrawal is simulated instantly. No real money moves.'}
            </p>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
