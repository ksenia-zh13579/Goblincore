import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login(username, password);
      login(
        { user_id: data.user_id, username: data.username, email: data.email },
        data.access_token,
        data.refresh_token
      );
      navigate('/transactions/expense');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-card__title">Goblincore</h1>
        <p className="auth-card__subtitle">Вход в трекер финансов</p>
        <Input
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Входим…' : 'Войти'}
        </Button>
        <p className="auth-card__footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}