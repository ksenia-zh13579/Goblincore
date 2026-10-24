import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../../shared/api/client';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

export function ProfilePage() {
  const { user, login, accessToken } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (password && password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      const { data } = await api.patch('/profile', {
        username,
        email,
        ...(password ? { password } : {}),
      });
      login(
        {
          user_id: Number(data.user.user_id),
          username: data.user.username,
          email: data.user.email,
        },
        accessToken!,
        '',
      );
      setMessage('Профиль обновлён');
      setPassword('');
      setConfirm('');
    } catch {
      setError('Не удалось сохранить изменения');
    }
  };

  return (
    <section className="page">
      <h1>Профиль</h1>
      <form className="form form--narrow" onSubmit={submit}>
        <Input label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Новый пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Подтверждение пароля" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <Button type="submit">Сохранить</Button>
      </form>
    </section>
  );
}