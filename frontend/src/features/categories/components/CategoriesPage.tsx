import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { categoriesApi, Category } from '../api/categoriesApi';
import { TransactionType } from '../../transactions/api/transactionsApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Breadcrumbs } from '../../navigation/components/Breadcrumbs';
import { CategoryForm } from './CategoryForm';

export function CategoriesPage() {
  const { type = 'expense' } = useParams<{ type: TransactionType }>();
  const txType = type as TransactionType;
  const withLimit = txType === 'expense';
  const { user } = useAuth();

  const [items, setItems] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await categoriesApi.list(txType, user.user_id);
    setItems(data);
  };

  useEffect(() => { load(); }, [txType, user]);

  const handleSubmit = async (data: { name: string; limit?: number }) => {
    if (!user) return;
    if (editing) {
      await categoriesApi.update(txType, editing.category_id, { user_id: user.user_id, ...data });
    } else {
      await categoriesApi.create(txType, { user_id: user.user_id, ...data });
    }
    setModalOpen(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('Удалить категорию? Если есть транзакции, она уйдёт в архив.')) return;
    await categoriesApi.remove(txType, id, user.user_id);
    await load();
  };

  return (
    <section className="page">
      <Breadcrumbs items={[{ to: '/', label: 'Главная' }, { label: withLimit ? 'Категории расходов' : 'Категории доходов' }]} />
      <header className="page__header">
        <h1>{withLimit ? 'Категории расходов' : 'Категории доходов'}</h1>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>+ Добавить</Button>
      </header>

      {items.length === 0 ? (
        <EmptyState text="Категорий пока нет" />
      ) : (
        <ul className="categories">
          {items.map((c) => (
            <li key={c.category_id} className="category-row">
              <div>
                <span className="category-row__name">{c.name}</span>
                {withLimit && c.limit != null && (
                  <span className="category-row__limit">Лимит: {c.limit.toLocaleString('ru-RU')} ₽</span>
                )}
              </div>
              <div className="category-row__actions">
                <Button variant="ghost" onClick={() => { setEditing(c); setModalOpen(true); }}>Изменить</Button>
                <Button variant="danger" onClick={() => handleDelete(c.category_id)}>Удалить</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Изменить категорию' : 'Новая категория'}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      >
        <CategoryForm
          withLimit={withLimit}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>
    </section>
  );
}