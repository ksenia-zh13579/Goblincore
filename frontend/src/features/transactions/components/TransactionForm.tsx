import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { TransactionPayload } from '../api/transactionsApi';
import { Category } from '../../categories/api/categoriesApi';

interface Props {
  userId: number;
  categories: Category[];
  initial?: Partial<TransactionPayload> & { category_name?: string };
  onSubmit: (data: TransactionPayload & { category_name?: string }) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ userId, categories, initial, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState(String(initial?.amount ?? ''));
  const [categoryId, setCategoryId] = useState(String(initial?.category_id ?? ''));
  const [customCategory, setCustomCategory] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [placeId, setPlaceId] = useState(String(initial?.place_id ?? ''));
  const [datetime, setDatetime] = useState(
    initial?.transaction_datetime?.slice(0, 16) ?? new Date().toISOString().slice(0, 16)
  );
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!useCustom && !categoryId) {
      setError('Выберите категорию или введите свою');
      return;
    }
    if (useCustom && !customCategory.trim()) {
      setError('Введите название категории');
      return;
    }

    await onSubmit({
      user_id: userId,
      place_id: Number(placeId),
      category_id: useCustom ? 0 : Number(categoryId),
      transaction_datetime: new Date(datetime).toISOString(),
      amount: Number(amount),
      comment,
      category_name: useCustom ? customCategory.trim() : undefined,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <Input
        label="Сумма, ₽"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <label className="field">
        <span className="field__label">Категория</span>
        <select
          className="field__input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={useCustom}
        >
          <option value="">— выберите —</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field field--checkbox">
        <input
          type="checkbox"
          checked={useCustom}
          onChange={(e) => setUseCustom(e.target.checked)}
        />
        <span>Ввести свою категорию</span>
      </label>

      {useCustom && (
        <Input
          label="Название своей категории"
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          placeholder="Например: Книги, Кофе, Подарки"
          required
        />
      )}

      <Input
        label="ID источника/получателя"
        type="number"
        value={placeId}
        onChange={(e) => setPlaceId(e.target.value)}
        required
      />

      <Input
        label="Дата и время"
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        required
      />

      <Input
        label="Описание"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="form-error">{error}</p>}

      <div className="form__actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}