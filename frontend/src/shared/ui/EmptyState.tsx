export function EmptyState({ text = 'Данные не найдены' }: { text?: string }) {
  return (
    <div className="empty-state">
      <p>{text}</p>
    </div>
  );
}