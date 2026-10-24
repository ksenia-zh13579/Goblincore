import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { TransactionPayload, TransactionType } from '../api/transactionsApi';
import { Category } from '../../categories/api/categoriesApi';

interface Props {
  type: TransactionType;
  categories: Category[];
  initial?: Partial<TransactionPayload>;
  onSubmit: (data: TransactionPayload) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ type, categories, initial, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState(String(initial?.amount ?? ''));
  const [categoryName, setCategoryName] = useState(initial?.category_name ?? '');
  const [categoryLimit, setCategoryLimit] = useState(initial?.category_limit ?? '');
  const [placeName, setPlaceName] = useState(initial?.place_name ?? '');
  const [date, setDate] = useState(
    initial?.transaction_date ?? new Date().toISOString().slice(0, 10)
  );
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedCategoryName = categoryName.trim();
    const existingCategory = categories.find(
      (category) => category.name.trim() === normalizedCategoryName
    );

    if (!normalizedCategoryName) {
      setError('Введите название категории');
      return;
    }
    if (type === 'expense' && !categoryLimit && !existingCategory) {
       setError('Для новой категории расходов нужно указать лимит (category_limit)');
       return;
    }
    if (!placeName.trim()) {
      setError('Введите название получателя/источника');
      return;
    }

    try {
      await onSubmit({
        type,
        amount: Number(amount).toFixed(2),
        category_name: normalizedCategoryName,
        category_limit: existingCategory
          ? undefined
          : categoryLimit
            ? Number(categoryLimit).toFixed(2)
            : undefined,
        place_name: placeName.trim(),
        transaction_date: date,
        comment,
      });
    } catch (submitError) {
      const message =
        (submitError as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Не удалось сохранить запись';
      setError(message);
    }
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
        <span className="field__label">Категория (выберите или введите свою)</span>
        <input
          className="field__input"
          list="category-list"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Например: Продукты"
          required
        />
        <datalist id="category-list">
          {categories.map((c) => (
            <option key={c.category_id} value={c.name} />
          ))}
        </datalist>
      </label>

      {/* Если категория новая и это расход, просим лимит */}
      {type === 'expense' && !categories.some(
        (category) => category.name.trim() === categoryName.trim()
      ) && (
        <Input
          label="Лимит на месяц для новой категории, ₽"
          type="number"
          step="0.01"
          value={categoryLimit}
          onChange={(e) => setCategoryLimit(e.target.value)}
          required
        />
      )}

      <Input
        label={type === 'income' ? "Источник дохода" : "Получатель (магазин, сервис)"}
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="Например: Пятерочка"
        required
      />

      <Input
        label="Дата"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
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