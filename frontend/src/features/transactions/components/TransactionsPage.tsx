import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionsApi, Transaction, TransactionPayload, TransactionType } from '../api/transactionsApi';
import { categoriesApi, Category } from '../../categories/api/categoriesApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Breadcrumbs } from '../../navigation/components/Breadcrumbs';
import { TransactionCard } from './TransactionCard';
import { TransactionForm } from './TransactionForm';

type SortKey = 'date' | 'amount' | 'place' | 'category';

export function TransactionsPage() {
  const { type = 'expense' } = useParams<{ type: TransactionType }>();
  const txType = type as TransactionType;
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
          q: query || undefined,
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
    const arr = [...items];
    switch (sort) {
      case 'amount': return arr.sort((a, b) => b.amount - a.amount);
      case 'place': return arr.sort((a, b) => a.place_name.localeCompare(b.place_name));
      case 'category': return arr.sort((a, b) => a.category_name.localeCompare(b.category_name));
      default: return arr.sort((a, b) =>
        new Date(b.transaction_datetime).getTime() - new Date(a.transaction_datetime).getTime()
      );
    }
  }, [items, sort]);

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

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('Удалить запись?')) return;
    await transactionsApi.remove(txType, id, user.user_id);
    await load();
  };

  return (
    <section className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Главная' }, { label: txType === 'income' ? 'Доходы' : 'Расходы' }]} />
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
        <Button variant="secondary" onClick={load}>Найти</Button>
      </div>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : sorted.length === 0 ? (
        <EmptyState text="Записей не найдено" />
      ) : (
        <div className="cards">
          {sorted.map((tx) => (
            <TransactionCard
              key={tx.transaction_id}
              tx={tx}
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
    place_name: editing.place_name,
    transaction_date: editing.transaction_datetime?.slice(0, 10),
    comment: editing.comment,
  } : undefined}
  onSubmit={handleSubmit}
  onCancel={() => { setModalOpen(false); setEditing(null); }}
/>
      </Modal>
    </section>
  );
}