import { api } from '../../../shared/api/client';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  transaction_id: number;
  place_name: string;
  category_name: string;
  transaction_datetime: string;
  amount: number;
  comment?: string;
}

export interface TransactionPayload {
  user_id: number;
  place_id: number;
  category_id: number;
  transaction_datetime: string;
  amount: number;
  comment?: string;
}

export const transactionsApi = {
  list: (
    type: TransactionType,
    userId: number,
    params: { start_date?: string; end_date?: string; q?: string; page?: number; limit?: number } = {}
  ) =>
    api.get<Transaction[]>(`/transactions/${type}`, {
      params: { user_id: userId, ...params },
    }),

  create: (type: TransactionType, data: TransactionPayload) =>
    api.post<Transaction>(`/transactions/${type}`, data),

  update: (type: TransactionType, id: number, data: TransactionPayload) =>
    api.patch<Transaction>(`/transactions/${type}/${id}`, data),

  remove: (type: TransactionType, id: number, userId: number) =>
    api.delete(`/transactions/${type}/${id}`, { params: { user_id: userId } }),
};