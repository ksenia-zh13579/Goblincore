import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Меняем username на email, так как бэкенд ждет email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      
      // Сохраняем данные пользователя и токен
      login(
        { 
          user_id: Number(data.user.user_id), 
          username: data.user.username, 
          email: data.user.email 
        },
        data.accessToken, 
        '' // refreshToken хранится в httpOnly cookie, в localStorage его не кладем
      );
      navigate('/transactions/expense');
    } catch (err: any) {
      // Показываем ошибку от бэкенда (например, "Неверный email или пароль")
      setError(err.response?.data?.message || 'Ошибка входа');
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
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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