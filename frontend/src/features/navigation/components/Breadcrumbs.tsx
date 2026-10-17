import { Link } from 'react-router-dom';

interface Crumb { to?: string; label: string; }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs">
      {items.map((c, i) => (
        <span key={i} className="breadcrumbs__item">
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          {i < items.length - 1 && <span className="breadcrumbs__sep">/</span>}
        </span>
      ))}
    </nav>
  );
}