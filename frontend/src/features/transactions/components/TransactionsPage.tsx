import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionsApi, Transaction, TransactionPayload, TransactionType } from '../api/transactionsApi';
import { categoriesApi, Category } from '../../categories/api/categoriesApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { TransactionCard } from './TransactionCard';
import { TransactionForm } from './TransactionForm';
import { toDateInputValue } from '../../../shared/utils/format';

type SortKey = 'date' | 'amount' | 'place' | 'category';

export function TransactionsPage() {
  const { type = 'expense' } = useParams<{ type: TransactionType }>();
  const txType: TransactionType = type === 'income' ? 'income' : 'expense';
  const { user } = useAuth();

  const [items, setItems] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        transactionsApi.list(txType, user.user_id, {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
        categoriesApi.list(txType, user.user_id),
      ]);
      setItems(txRes.data);
      setCategories(catRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, user, startDate, endDate]);

  const sorted = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
    const filtered = normalizedQuery
      ? items.filter((tx) => [
          tx.place_name,
          tx.category_name,
          tx.comment,
          tx.transaction_date,
          String(tx.amount),
        ].some((value) => value?.toLocaleLowerCase('ru-RU').includes(normalizedQuery)))
      : items;
    const arr = [...filtered];
    switch (sort) {
      case 'amount': return arr.sort((a, b) => Number(b.amount) - Number(a.amount));
      case 'place': return arr.sort((a, b) =>
        (a.place_name || '').localeCompare(b.place_name || '')
      );
      case 'category': return arr.sort((a, b) => a.category_name.localeCompare(b.category_name));
      default: return arr.sort((a, b) =>
        new Date(`${b.transaction_date}T00:00:00`).getTime() -
        new Date(`${a.transaction_date}T00:00:00`).getTime()
      );
    }
  }, [items, query, sort]);

  const handleSubmit = async (payload: TransactionPayload) => {
    if (editing) {
      await transactionsApi.update(txType, editing.transaction_id, payload);
    } else {
      await transactionsApi.create(txType, payload);
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: number | string) => {
    if (!user) return;
    if (!confirm('Удалить запись?')) return;
    await transactionsApi.remove(txType, id, user.user_id);
    await load();
  };

  return (
    <section className="page">
      <header className="page__header">
        <h1>{txType === 'income' ? 'Доходы' : 'Расходы'}</h1>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          + Добавить
        </Button>
      </header>

      <div className="toolbar">
        <Input placeholder="Поиск…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="field">
          <span className="field__label">Сортировка</span>
          <select className="field__input" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="date">По новизне</option>
            <option value="amount">По сумме</option>
            <option value="place">По {txType === 'income' ? 'источнику' : 'получателю'}</option>
            <option value="category">По категории</option>
          </select>
        </label>
        <Input label="С" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="По" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : sorted.length === 0 ? (
        <EmptyState text="Записей не найдено" />
      ) : (
        <div className={`cards cards--${txType}`}>
          {sorted.map((tx) => (
            <TransactionCard
              key={tx.transaction_id}
              tx={tx}
              categoryLimit={
                tx.type === 'expense'
                  ? categories.find((category) => category.name === tx.category_name)?.category_limit
                  : undefined
              }
              onEdit={() => { setEditing(tx); setModalOpen(true); }}
              onDelete={() => handleDelete(tx.transaction_id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Изменить запись' : 'Новая запись'}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      >
        <TransactionForm
  type={txType} // <-- Добавили
  categories={categories}
  initial={editing ? {
    amount: String(editing.amount),
    category_name: editing.category_name,
    place_name: editing.place_name ?? '',
    transaction_date: toDateInputValue(editing.transaction_date),
    comment: editing.comment,
  } : undefined}
  onSubmit={handleSubmit}
  onCancel={() => { setModalOpen(false); setEditing(null); }}
/>
      </Modal>
    </section>
  );
}