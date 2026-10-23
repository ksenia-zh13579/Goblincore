import { Transaction } from '../api/transactionsApi';
import { Button } from '../../../shared/ui/Button';

interface Props {
  tx: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionCard({ tx, onEdit, onDelete }: Props) {
  return (
    <article className="card">
      <header className="card__header">
        <div>
          <h3 className="card__title">{tx.place_name}</h3>
          <span className="card__category">{tx.category_name}</span>
        </div>
        <span className="card__amount">{tx.amount.toLocaleString('ru-RU')} ₽</span>
      </header>
      <p className="card__date">
        {new Date(tx.transaction_datetime).toLocaleString('ru-RU')}
      </p>
      {tx.comment && <p className="card__comment">{tx.comment}</p>}
      <footer className="card__actions">
        <Button variant="ghost" onClick={onEdit}>Изменить</Button>
        <Button variant="danger" onClick={onDelete}>Удалить</Button>
      </footer>
    </article>
  );
}