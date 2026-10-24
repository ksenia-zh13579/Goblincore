import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Category } from '../api/categoriesApi';
import { TransactionType } from '../../transactions/api/transactionsApi';

interface Props {
  initial?: Partial<Category>;
  onSubmit: (data: { name: string; limit?: number; type: TransactionType }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<TransactionType>(initial?.category_type ?? 'expense');
  const [limit, setLimit] = useState(String(initial?.category_limit ?? ''));
  const withLimit = type === 'expense';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, type, limit: withLimit ? Number(limit) : undefined });
  };

  return (
    <form className="form" onSubmit={submit}>
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
      <label className="field">
        <span className="field__label">Тип категории</span>
        <select
          className="field__input"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          disabled={Boolean(initial)}
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>
      </label>
      {withLimit && (
        <Input label="Лимит на месяц, ₽" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
      )}
      <div className="form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}