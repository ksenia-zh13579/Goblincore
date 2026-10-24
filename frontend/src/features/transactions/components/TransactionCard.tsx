import { Transaction } from '../api/transactionsApi';
import { Button } from '../../../shared/ui/Button';
import { formatAmount, formatDate } from '../../../shared/utils/format';

interface Props {
  tx: Transaction;
  categoryLimit?: string | number | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionCard({ tx, categoryLimit, onEdit, onDelete }: Props) {
  const isOverLimit =
    tx.type === 'expense' &&
    categoryLimit != null &&
    Number(tx.amount) > Number(categoryLimit);

  return (
    <article className={`card${isOverLimit ? ' card--over-limit' : ''}`}>
      <header className="card__header">
        <div>
          <h3 className="card__title">{tx.place_name || 'Без названия'}</h3>
          <span className="card__category">
            {tx.category_name}
            {tx.type === 'expense' && categoryLimit != null && (
              <> · Лимит: {formatAmount(categoryLimit)} ₽</>
            )}
          </span>
        </div>
        <span className="card__amount">
          {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)} ₽
        </span>
      </header>
      <p className="card__date">
        {formatDate(tx.transaction_date)}
      </p>
      {tx.comment && <p className="card__comment">{tx.comment}</p>}
      <footer className="card__actions">
        <Button variant="ghost" onClick={onEdit}>Изменить</Button>
        <Button variant="danger" onClick={onDelete}>Удалить</Button>
      </footer>
    </article>
  );
}