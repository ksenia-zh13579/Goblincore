import { api } from '../../../shared/api/client';
import { TransactionType } from '../../transactions/api/transactionsApi';

export interface Category {
  category_id: number;
  name: string;
  limit?: number;
}

export const categoriesApi = {
  list: (type: TransactionType, userId: number) =>
    api.get<Category[]>(`/categories/${type}`, { params: { user_id: userId } }),

  create: (type: TransactionType, data: { user_id: number; name: string; limit?: number }) =>
    api.post<Category>(`/categories/${type === 'income' ? 'income' : 'expense'}`, data),

  update: (type: TransactionType, id: number, data: { user_id: number; name: string; limit?: number }) =>
    api.patch<Category>(
      `/categories/${type === 'income' ? 'income' : 'expense'}/${id}`,
      data
    ),

  remove: (type: TransactionType, id: number, userId: number) =>
    api.delete(`/categories/${type}/${id}`, { params: { user_id: userId } }),
};