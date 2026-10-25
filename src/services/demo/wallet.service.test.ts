import { beforeEach, describe, expect, it } from 'vitest';
import { PLATFORM_FEE_PERCENT } from '@/app/config';
import { getDb, resetDb, saveDb } from './db';
import * as sessions from './sessions.service';
import * as wallet from './wallet.service';

function signInAs(userId: string) {
  const db = getDb();
  db.currentUserId = userId;
  saveDb();
}

function tomorrowAt(hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

beforeEach(() => {
  resetDb();
  signInAs('student-mary');
});

describe('demo wallet', () => {
  it('tops up and withdraws to mobile money', async () => {
    const before = await wallet.getWallet();
    expect(before.availableBalance).toBe(300000);

    const afterTopUp = await wallet.topUp({
      amount: 50000,
      phone: '+256 772 445 019',
      network: 'MTN',
    });
    expect(afterTopUp.availableBalance).toBe(350000);

    const afterWithdraw = await wallet.withdraw({
      amount: 20000,
      phone: '+256 772 445 019',
      network: 'AIRTEL',
    });
    expect(afterWithdraw.availableBalance).toBe(330000);

    const transactions = await wallet.listTransactions();
    expect(transactions[0]?.type).toBe('WITHDRAWAL');
    expect(transactions[0]?.amount).toBe(-20000);
  });

  it('rejects withdrawals larger than the available balance', async () => {
    await expect(
      wallet.withdraw({ amount: 400000, phone: '+256 772 445 019', network: 'MTN' }),
    ).rejects.toThrow(/available balance/i);
  });

  it('holds the session fee in escrow and refunds it on cancellation', async () => {
    const session = await sessions.create({
      tutorId: 'tutor-sarah',
      subject: 'Mathematics',
      scheduledAt: tomorrowAt(14),
      message: 'Quadratic equations please.',
    });

    const held = await wallet.getWallet();
    expect(held.availableBalance).toBe(215000);
    expect(held.escrowBalance).toBe(85000);

    const cancelled = await sessions.updateStatus(session.id, 'CANCELLED');
    expect(cancelled.status).toBe('CANCELLED');

    const refunded = await wallet.getWallet();
    expect(refunded.availableBalance).toBe(300000);
    expect(refunded.escrowBalance).toBe(0);
  });

  it('releases earnings to the tutor minus the platform fee on completion', async () => {
    const session = await sessions.create({
      tutorId: 'tutor-sarah',
      subject: 'Mathematics',
      scheduledAt: tomorrowAt(15),
    });

    signInAs('tutor-sarah');
    await sessions.updateStatus(session.id, 'ACCEPTED');
    await sessions.updateStatus(session.id, 'COMPLETED');

    const tutorWallet = await wallet.getWallet();
    const net = 85000 - Math.round((85000 * PLATFORM_FEE_PERCENT) / 100);
    expect(tutorWallet.escrowBalance).toBe(0);
    expect(tutorWallet.availableBalance).toBe(185000 + net);

    signInAs('student-mary');
    const studentWallet = await wallet.getWallet();
    expect(studentWallet.escrowBalance).toBe(0);
    expect(studentWallet.availableBalance).toBe(215000);
  });
});
