import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Category } from '../api/categoriesApi';

interface Props {
  initial?: Partial<Category>;
  withLimit: boolean;
  onSubmit: (data: { name: string; limit?: number }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, withLimit, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [limit, setLimit] = useState(String(initial?.limit ?? ''));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, limit: withLimit ? Number(limit) : undefined });
  };

  return (
    <form className="form" onSubmit={submit}>
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
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