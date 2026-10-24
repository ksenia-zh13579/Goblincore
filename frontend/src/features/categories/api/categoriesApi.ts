import { api } from '../../../shared/api/client';
import { TransactionType } from '../../transactions/api/transactionsApi';

export interface Category {
  category_id: number;
  name: string;
  category_type: TransactionType;
  category_limit?: string | number; // Бэкенд возвращает лимит строкой
}

export interface CategoryPayload {
  name: string;
  category_type: TransactionType;
  category_limit?: string; // Для расходов обязателен!
}

export const categoriesApi = {
  // Получаем список с фильтром по типу (бэкенд поддерживает ?type=expense)
  list: (type: TransactionType, userId?: number) =>
    api.get<Category[]>('/categories', {
      params: { type } // Передаем ?type=income или ?type=expense
    }),

  // Создание категории
  create: (type: TransactionType, data: { name: string; limit?: number }) =>
    api.post<Category>('/categories', {
      name: data.name,
      category_type: type,
      // Если это расход, передаем лимит. Бэкенд требует его для новых категорий расходов.
      ...(type === 'expense' && data.limit ? { category_limit: String(data.limit) } : {})
    }),

  // Обновление категории (тип менять нельзя)
  update: (type: TransactionType, id: number, data: { name: string; limit?: number }) =>
    api.patch<Category>(`/categories/${id}`, {
      name: data.name,
      ...(type === 'expense' && data.limit ? { category_limit: String(data.limit) } : {})
    }),

  // Удаление категории
  remove: (type: TransactionType, id: number, userId?: number) =>
    api.delete(`/categories/${id}`),
};