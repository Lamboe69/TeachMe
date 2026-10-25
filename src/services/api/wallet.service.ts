import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Wallet, WalletTransaction, WalletTransactionType } from '@/types';
import type { TopUpRequest, WithdrawRequest } from '@/types/api';

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json {
  return (value ?? {}) as Json;
}

function nested(data: unknown): Json {
  const record = asRecord(data);
  return asRecord(record['data'] ?? record['wallet'] ?? record);
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapWallet(data: unknown): Wallet {
  const record = nested(data);
  return {
    userId: String(record['userId'] ?? record['user_id'] ?? ''),
    availableBalance: asNumber(
      record['availableBalance'] ?? record['available_balance'] ?? record['balance'],
    ),
    escrowBalance: asNumber(record['escrowBalance'] ?? record['escrow_balance'] ?? 0),
    currency: 'UGX',
    updatedAt: (record['updatedAt'] ?? record['updated_at'] ?? null) as string | null,
  };
}

const TXN_TYPES: WalletTransactionType[] = [
  'TOP_UP',
  'WITHDRAWAL',
  'SESSION_PAYMENT',
  'SESSION_EARNING',
  'REFUND',
];

function mapTransaction(data: unknown): WalletTransaction {
  const record = nested(data);
  const rawType = String(record['type'] ?? '').toUpperCase();
  const type = (TXN_TYPES.find((entry) => entry === rawType) ?? 'TOP_UP') as WalletTransactionType;
  return {
    id: String(record['id'] ?? ''),
    userId: String(record['userId'] ?? record['user_id'] ?? ''),
    type,
    amount: asNumber(record['amount']),
    balanceAfter: asNumber(record['balanceAfter'] ?? record['balance_after'] ?? 0),
    sessionId: (record['sessionId'] ?? record['session_id'] ?? null) as string | null,
    description: String(record['description'] ?? record['narration'] ?? ''),
    reference: (record['reference'] ?? record['ref'] ?? null) as string | null,
    createdAt: (record['createdAt'] ?? record['created_at'] ?? null) as string | null,
  };
}

export async function getWallet(): Promise<Wallet> {
  const { data } = await apiClient.get(API_ENDPOINTS.wallet.me);
  return mapWallet(data);
}

export async function listTransactions(): Promise<WalletTransaction[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.wallet.transactions);
  const record = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : ((record['content'] ?? record['data'] ?? record['transactions'] ?? []) as unknown[]);
  return (Array.isArray(list) ? list : []).map(mapTransaction);
}

export async function topUp(payload: TopUpRequest): Promise<Wallet> {
  const { data } = await apiClient.post(API_ENDPOINTS.wallet.topUp, payload);
  return mapWallet(data);
}

export async function withdraw(payload: WithdrawRequest): Promise<Wallet> {
  const { data } = await apiClient.post(API_ENDPOINTS.wallet.withdraw, payload);
  return mapWallet(data);
}
