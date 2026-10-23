import { api } from '../../../shared/api/client';

export type TransactionType = 'income' | 'expense';

// То, что приходит с бэкенда
export interface Transaction {
  transaction_id: number;
  place_name: string;
  category_name: string;
  transaction_datetime: string; // или transaction_date
  amount: string | number;
  comment?: string;
}

// То, что ждет бэкенд при создании (см. Swagger в routes)
export interface TransactionPayload {
  category_name: string;
  category_limit?: string; // Обязательно для новых категорий расходов!
  place_name: string;
  amount: string;
  comment?: string;
  transaction_date: string; // Бэкенд ждет date (YYYY-MM-DD)
  type: TransactionType;
}

// То, что ждет бэкенд при обновлении
export interface PatchTransactionPayload {
  category_name?: string;
  category_limit?: string;
  place_name?: string;
  amount?: string;
  comment?: string;
  transaction_date?: string;
  type?: TransactionType;
}

export const transactionsApi = {
  // 1. Получить список (бэкенд отдает все сразу, без разделения на income/expense)
  list: (
    type: TransactionType,
    userId: number, // На бэкенде userId не используется в query, он берется из токена
    params: { start_date?: string; end_date?: string; q?: string; page?: number; limit?: number } = {}
  ) =>
    api.get<Transaction[]>('/api/transactions', {
      params: params, // Убрали user_id, так как бэкенд берет его из токена
    }).then(res => {
      // Так как бэкенд отдает общий список, отфильтруем его на клиенте по типу
      // (В идеале бэкенд должен это делать, но пока так)
      return {
        ...res,
        data: res.data.filter(tx => {
          // В идеале на бэкенде должна быть проверка типа, но если там нет поля type в ответе,
          // придется фильтровать иначе. Пока возвращаем всё.
          return true; 
        })
      }
    }),

  // 2. Создать (без /expense в URL, тип внутри body)
  create: (type: TransactionType, data: TransactionPayload) =>
    api.post<Transaction>('/api/transactions', { ...data, type }),

  // 3. Обновить (без /expense в URL)
  update: (type: TransactionType, id: number, data: PatchTransactionPayload) =>
    api.patch<Transaction>(`/api/transactions/${id}`, data),

  // 4. Удалить (без /expense в URL)
  remove: (type: TransactionType, id: number, userId: number) =>
    api.delete(`/api/transactions/${id}`), 
};