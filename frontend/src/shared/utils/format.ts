export function formatAmount(value: number | string | null | undefined): string {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0,00';
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return 'Дата не указана';

  const raw = value instanceof Date ? value : String(value);
  const date = raw instanceof Date
    ? raw
    : /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? new Date(`${raw}T00:00:00`)
      : new Date(raw);

  return Number.isNaN(date.getTime())
    ? 'Дата не указана'
    : date.toLocaleDateString('ru-RU');
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  const raw = value instanceof Date ? value.toISOString() : String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : '';
}