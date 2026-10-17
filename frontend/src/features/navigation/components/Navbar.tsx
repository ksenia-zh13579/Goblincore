import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTheme } from '../../../app/providers/ThemeProvider';

export function Navbar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  const link = (to: string, label: string) => (
    <Link className={pathname.startsWith(to) ? 'nav__link nav__link--active' : 'nav__link'} to={to}>
      {label}
    </Link>
  );

  return (
    <header className="nav">
      <div className="nav__inner container">
        <Link to="/" className="nav__brand">
          <img src="/emerald_1.png" alt="" className="nav__brand-logo" />
          <span>Goblincore</span>
        </Link>
        <nav className="nav__links">
          {link('/transactions/income', 'Доходы')}
          {link('/transactions/expense', 'Расходы')}
          {link('/categories/income', 'Категории доходов')}
          {link('/categories/expense', 'Категории расходов')}
          {link('/statistics', 'Статистика')}
          {link('/profile', 'Профиль')}
        </nav>
        <div className="nav__actions">
          <button className="nav__icon" onClick={toggleTheme} title="Сменить тему">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="nav__icon" onClick={logout} title="Выйти">X</button>
        </div>
      </div>
    </header>
  );
}