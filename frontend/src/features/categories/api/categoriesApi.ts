import { api } from '../../../shared/api/client';
import { TransactionType } from '../../transactions/api/transactionsApi';

export interface Category {
  category_id: string;
  name: string;
  limit?: number | string | null;
}

export const categoriesApi = {
  list: (type: TransactionType, _userId: string) =>
    api.get<Category[]>('/transactions/categories', { params: { type } }),
  create: (type: TransactionType, data: { name: string; limit?: number }) =>
    api.post<Category>('/transactions/categories', { ...data, type }),
  update: (type: TransactionType, id: string, data: { name: string; limit?: number }) =>
    api.patch<Category>(`/transactions/categories/${id}`, { ...data, type }),
  remove: (_type: TransactionType, id: string, _userId: string) =>
    api.delete(`/transactions/categories/${id}`),
};