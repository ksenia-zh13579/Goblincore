import { FormEvent, useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { TransactionPayload, TransactionType } from '../api/transactionsApi';
import { Category } from '../../categories/api/categoriesApi';

interface Props {
  categories: Category[];
  initial?: Partial<TransactionPayload>;
  onSubmit: (data: TransactionPayload) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ categories, initial, onSubmit, onCancel }: Props) {
  const initialType = initial?.type ?? 'expense';
  const [amount, setAmount] = useState(
    initial?.amount != null ? `${initialType === 'income' ? '+' : '-'}${initial.amount}` : ''
  );
  const [categoryName, setCategoryName] = useState(initial?.category_name ?? '');
  const [categoryLimit, setCategoryLimit] = useState(initial?.category_limit ?? '');
  const [placeName, setPlaceName] = useState(initial?.place_name ?? '');
  const [date, setDate] = useState(
    initial?.transaction_date ?? new Date().toISOString().slice(0, 10)
  );
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const incomeCategories = categories.filter((category) => category.category_type === 'income');
  const expenseCategories = categories.filter((category) => category.category_type === 'expense');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedCategoryName = categoryName.trim();
    const amountMatch = amount.match(/^([+-])(\d+(?:[.,]\d{1,2})?)$/);
    const transactionType: TransactionType | null =
      amountMatch?.[1] === '+' ? 'income' : amountMatch?.[1] === '-' ? 'expense' : null;
    const absoluteAmount = amountMatch?.[2].replace(',', '.');
    const existingCategory = categories.find(
      (category) =>
        category.category_type === transactionType &&
        category.name.trim() === normalizedCategoryName
    );

    if (!transactionType || !absoluteAmount) {
      setError('Сумма должна начинаться с одного знака + или -');
      return;
    }
    if (!normalizedCategoryName) {
      setError('Введите название категории');
      return;
    }
    if (transactionType === 'expense' && !categoryLimit && !existingCategory) {
       setError('Для новой категории расходов нужно указать лимит (category_limit)');
       return;
    }
    if (!placeName.trim()) {
      setError('Введите название получателя/источника');
      return;
    }

    try {
      await onSubmit({
        type: transactionType,
        amount: Number(absoluteAmount).toFixed(2),
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
        type="text"
        inputMode="decimal"
        step="0.01"
        value={amount}
        onChange={(e) => {
          const value = e.target.value.replace(/[^\d.,+-]/g, '');
          const sign = value[0] === '+' || value[0] === '-' ? value[0] : '';
          const digits = value.replace(/[+-]/g, '');
          setAmount(`${sign}${digits}`);
        }}
        placeholder="+1000 или -500"
        required
      />

      <label className="field">
        <span className="category-field__label">
          <span className="field__label">Категория (выберите или введите свою)</span>
          <span className="category-help">
            <button
              type="button"
              className="category-help__trigger"
              aria-label="Показать все категории"
            >
              ?
            </button>
            <span className="category-help__popover" role="tooltip">
              <strong>Все категории</strong>
              <span className="category-help__group">
                <b>Доходы</b>
                {incomeCategories.length > 0 ? (
                  incomeCategories.map((category) => (
                    <span key={`income-${category.category_id}`}>{category.name}</span>
                  ))
                ) : (
                  <em>Нет категорий</em>
                )}
              </span>
              <span className="category-help__group">
                <b>Расходы</b>
                {expenseCategories.length > 0 ? (
                  expenseCategories.map((category) => (
                    <span key={`expense-${category.category_id}`}>{category.name}</span>
                  ))
                ) : (
                  <em>Нет категорий</em>
                )}
              </span>
            </span>
          </span>
        </span>
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
      {amount.startsWith('-') && !categories.some(
        (category) =>
          category.category_type === 'expense' &&
          category.name.trim() === categoryName.trim()
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
        label={amount.startsWith('+') ? "Источник дохода" : "Получатель (магазин, сервис)"}
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