import { ReactNode } from 'react';

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h3>{title}</h3>
          <button className="modal__close" onClick={onClose}>×</button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}