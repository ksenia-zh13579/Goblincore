import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { TransactionPayload, TransactionType } from '../api/transactionsApi';
import { Category } from '../../categories/api/categoriesApi';

interface Props {
  type: TransactionType;
  categories: Category[];
  initial?: Partial<TransactionPayload>;
  onSubmit: (data: Omit<TransactionPayload, 'type'>) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ type, categories, initial, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState(String(initial?.amount ?? ''));
  const [categoryName, setCategoryName] = useState(initial?.category_name ?? '');
  const [categoryLimit, setCategoryLimit] = useState(String(initial?.category_limit ?? ''));
  const [placeName, setPlaceName] = useState(initial?.place_name ?? '');
  const [date, setDate] = useState(initial?.transaction_date ?? new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!categoryName.trim()) {
      setError('Укажите категорию');
      return;
    }
    try {
      await onSubmit({
        category_name: categoryName.trim(),
        category_limit: type === 'expense' && categoryLimit ? Number(categoryLimit) : undefined,
        place_name: placeName.trim() || null,
        transaction_date: date,
        amount: Number(amount),
        comment: comment.trim() || null,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось сохранить запись');
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <Input label="Сумма, ₽" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <label className="field">
        <span className="field__label">Категория</span>
        <input className="field__input" list="category-options" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
        <datalist id="category-options">{categories.map((c) => <option key={c.category_id} value={c.name} />)}</datalist>
      </label>
      {type === 'expense' && <Input label="Лимит новой категории, ₽" type="number" min="0.01" step="0.01" value={categoryLimit} onChange={(e) => setCategoryLimit(e.target.value)} />}
      <Input label="Место или источник" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
      <Input label="Дата" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <Input label="Описание" value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <p className="form-error">{error}</p>}
      <div className="form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}
