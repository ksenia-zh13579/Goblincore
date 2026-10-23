import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../../features/auth/api/authApi';

interface User {
  user_id: string;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  login: (user: User, access: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Инициализация из localStorage — пользователь остаётся залогинен после перезагрузки
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('gbc_user');
    return raw ? JSON.parse(raw) : null;
  });
  
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('gbc_access')
  );

  const login = (u: User, access: string) => {
    setUser(u);
    setAccessToken(access);
    localStorage.setItem('gbc_user', JSON.stringify(u));
    localStorage.setItem('gbc_access', access);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('gbc_user');
    localStorage.removeItem('gbc_access');
    void authApi.logout().catch(() => undefined);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}