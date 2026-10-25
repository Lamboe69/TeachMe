import { PLATFORM_FEE_PERCENT } from '@/app/config';
import { throwAppError } from '@/utils/apiError';
import type { Session, Wallet, WalletTransaction, WalletTransactionType } from '@/types';
import type { TopUpRequest, WithdrawRequest } from '@/types/api';
import { createId, findUserById, getDb, saveDb } from './db';

/** Simulated mobile money latency so pending states are visible. */
function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function currentUserId(): string {
  const db = getDb();
  if (!db.currentUserId) {
    throwAppError(401, 'Your session has expired. Please sign in again.');
  }
  return db.currentUserId;
}

function ensureWallet(userId: string): Wallet {
  const db = getDb();
  const existing = db.wallets[userId];
  if (existing) return existing;
  const wallet: Wallet = {
    userId,
    availableBalance: 0,
    escrowBalance: 0,
    currency: 'UGX',
    updatedAt: new Date().toISOString(),
  };
  db.wallets[userId] = wallet;
  return wallet;
}

function record(
  userId: string,
  type: WalletTransactionType,
  amount: number,
  balanceAfter: number,
  description: string,
  sessionId: string | null = null,
): WalletTransaction {
  const db = getDb();
  const transaction: WalletTransaction = {
    id: createId('txn'),
    userId,
    type,
    amount,
    balanceAfter,
    sessionId,
    description,
    reference: createId('ref').toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  db.transactions.unshift(transaction);
  return transaction;
}

function validateAmount(amount: number): number {
  const rounded = Math.round(Number(amount));
  if (!Number.isFinite(rounded) || rounded < 1000) {
    throwAppError(400, 'Enter an amount of at least UGX 1,000.', {
      amount: 'Enter an amount of at least UGX 1,000.',
    });
  }
  if (rounded > 5_000_000) {
    throwAppError(400, 'Mobile money transfers are limited to UGX 5,000,000 at a time.', {
      amount: 'Maximum UGX 5,000,000 per transfer.',
    });
  }
  return rounded;
}

function validatePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!/^\+?[0-9]{9,15}$/.test(cleaned)) {
    throwAppError(400, 'Enter a valid mobile money number, e.g. +256 772 445 019.', {
      phone: 'Enter a valid mobile money number.',
    });
  }
  return cleaned;
}

function networkLabel(network: TopUpRequest['network']): string {
  return network === 'AIRTEL' ? 'Airtel Money' : 'MTN MoMo';
}

export async function getWallet(): Promise<Wallet> {
  await delay(250);
  const userId = currentUserId();
  const wallet = ensureWallet(userId);
  saveDb();
  return { ...wallet };
}

export async function listTransactions(): Promise<WalletTransaction[]> {
  await delay(250);
  const userId = currentUserId();
  const db = getDb();
  return db.transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

export async function topUp(payload: TopUpRequest): Promise<Wallet> {
  await delay(900);
  const userId = currentUserId();
  const amount = validateAmount(payload.amount);
  const phone = validatePhone(payload.phone ?? '');
  const network = payload.network === 'AIRTEL' ? 'AIRTEL' : 'MTN';

  const wallet = ensureWallet(userId);
  wallet.availableBalance += amount;
  wallet.updatedAt = new Date().toISOString();
  record(
    userId,
    'TOP_UP',
    amount,
    wallet.availableBalance,
    `Top-up via ${networkLabel(network)} · ${phone}`,
  );
  saveDb();
  return { ...wallet };
}

export async function withdraw(payload: WithdrawRequest): Promise<Wallet> {
  await delay(900);
  const userId = currentUserId();
  const amount = validateAmount(payload.amount);
  const phone = validatePhone(payload.phone ?? '');
  const network = payload.network === 'AIRTEL' ? 'AIRTEL' : 'MTN';

  const wallet = ensureWallet(userId);
  if (amount > wallet.availableBalance) {
    throwAppError(400, 'You cannot withdraw more than your available balance.', {
      amount: 'Amount exceeds your available balance.',
    });
  }

  wallet.availableBalance -= amount;
  wallet.updatedAt = new Date().toISOString();
  record(
    userId,
    'WITHDRAWAL',
    -amount,
    wallet.availableBalance,
    `Withdrawal to ${networkLabel(network)} · ${phone}`,
  );
  saveDb();
  return { ...wallet };
}

/**
 * Moves a session fee from the student's available balance into escrow.
 * Must be called when a booking request is created.
 */
export function holdSessionFunds(session: Session): void {
  const amount = session.fee ?? 0;
  if (amount <= 0) return;

  const db = getDb();
  const existing = db.escrows[session.id];
  if (existing && existing.status !== 'REFUNDED') return;

  const studentWallet = ensureWallet(session.student.id);
  if (studentWallet.availableBalance < amount) {
    throwAppError(
      400,
      'Your wallet balance is too low for this session. Top up your wallet and try again.',
      { wallet: 'Top up your wallet to book this session.' },
    );
  }

  const fee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100);
  const tutorNet = Math.max(0, amount - fee);

  const tutor = findUserById(session.tutor.id);
  const tutorWallet = tutor ? ensureWallet(tutor.id) : null;

  studentWallet.availableBalance -= amount;
  studentWallet.escrowBalance += amount;
  studentWallet.updatedAt = new Date().toISOString();
  if (tutorWallet) {
    tutorWallet.escrowBalance += tutorNet;
    tutorWallet.updatedAt = new Date().toISOString();
  }

  db.escrows[session.id] = {
    sessionId: session.id,
    studentId: session.student.id,
    tutorId: session.tutor.id,
    amount,
    status: 'HELD',
    createdAt: new Date().toISOString(),
  };

  record(
    session.student.id,
    'SESSION_PAYMENT',
    -amount,
    studentWallet.availableBalance,
    `Session with ${session.tutor.fullName} held in escrow`,
    session.id,
  );
  saveDb();
}

/** Releases held funds to the tutor (minus the platform fee). */
export function releaseSessionEarnings(session: Session): void {
  const db = getDb();
  const escrow = db.escrows[session.id];
  if (!escrow || escrow.status !== 'HELD') return;

  const fee = Math.round((escrow.amount * PLATFORM_FEE_PERCENT) / 100);
  const tutorNet = Math.max(0, escrow.amount - fee);

  const studentWallet = ensureWallet(escrow.studentId);
  studentWallet.escrowBalance = Math.max(0, studentWallet.escrowBalance - escrow.amount);

  const tutorWallet = ensureWallet(escrow.tutorId);
  tutorWallet.escrowBalance = Math.max(0, tutorWallet.escrowBalance - tutorNet);
  tutorWallet.availableBalance += tutorNet;
  tutorWallet.updatedAt = new Date().toISOString();

  escrow.status = 'RELEASED';
  studentWallet.updatedAt = new Date().toISOString();

  record(
    escrow.tutorId,
    'SESSION_EARNING',
    tutorNet,
    tutorWallet.availableBalance,
    `${session.subject} session earnings after ${PLATFORM_FEE_PERCENT}% TutorUG fee`,
    session.id,
  );
  saveDb();
}

/** Returns held funds to the student when a request is declined or cancelled. */
export function refundSessionFunds(session: Session): void {
  const db = getDb();
  const escrow = db.escrows[session.id];
  if (!escrow || escrow.status !== 'HELD') return;

  const fee = Math.round((escrow.amount * PLATFORM_FEE_PERCENT) / 100);
  const tutorNet = Math.max(0, escrow.amount - fee);

  const studentWallet = ensureWallet(escrow.studentId);
  studentWallet.escrowBalance = Math.max(0, studentWallet.escrowBalance - escrow.amount);
  studentWallet.availableBalance += escrow.amount;
  studentWallet.updatedAt = new Date().toISOString();

  const tutorWallet = ensureWallet(escrow.tutorId);
  tutorWallet.escrowBalance = Math.max(0, tutorWallet.escrowBalance - tutorNet);

  escrow.status = 'REFUNDED';

  record(
    escrow.studentId,
    'REFUND',
    escrow.amount,
    studentWallet.availableBalance,
    `Refund for ${session.subject} session · ${session.tutor.fullName}`,
    session.id,
  );
  saveDb();
}
