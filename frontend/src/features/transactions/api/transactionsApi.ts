import { api } from '../../../shared/api/client';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  transaction_id: string;
  category_id: string;
  category_name: string;
  transaction_date: string;
  amount: string;
  comment: string | null;
  place_id: string | null;
  place_name: string | null;
  type: TransactionType;
}

export interface TransactionPayload {
  category_name: string;
  category_limit?: number;
  place_name?: string | null;
  transaction_date: string;
  amount: number;
  comment?: string | null;
  type: TransactionType;
}

export const transactionsApi = {
  list: (
    type: TransactionType,
    _userId: string,
    params: { start_date?: string; end_date?: string; q?: string } = {}
  ) => api.get<Transaction[]>('/transactions').then((response) => ({
    ...response,
    data: response.data.filter((item) => {
      const date = item.transaction_date.slice(0, 10);
      const matchesDate =
        (!params.start_date || date >= params.start_date) &&
        (!params.end_date || date <= params.end_date);
      const query = params.q?.trim().toLowerCase();
      const matchesQuery = !query ||
        item.category_name.toLowerCase().includes(query) ||
        (item.place_name ?? '').toLowerCase().includes(query) ||
        (item.comment ?? '').toLowerCase().includes(query);
      return item.type === type && matchesDate && matchesQuery;
    }),
  })),

  create: (type: TransactionType, data: Omit<TransactionPayload, 'type'>) =>
    api.post<Transaction>('/transactions', { ...data, type }),

  update: (type: TransactionType, id: string, data: Partial<TransactionPayload>) =>
    api.patch<Transaction>(`/transactions/${id}`, { ...data, type }),

  remove: (_type: TransactionType, id: string, _userId: string) =>
    api.delete(`/transactions/${id}`),
};
