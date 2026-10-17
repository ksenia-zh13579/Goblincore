import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.register({ username, email, password_hash: password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-card__title">Goblincore</h1>
        <p className="auth-card__subtitle">Создание аккаунта</p>
        <Input label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <Button type="submit">Зарегистрироваться</Button>
        <p className="auth-card__footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}