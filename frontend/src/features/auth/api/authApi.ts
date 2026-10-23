import { api } from '../../../shared/api/client';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  user: {
    user_id: string;
    username: string;
    email: string;
  };
}

export const authApi = {
  // Регистрация (путь совпадает с router.post("/register"))
  register: (data: RegisterPayload) => 
    api.post('/api/auth/register', data),

  // Вход (путь /login, поля email и password)
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),
    
  // Обновление токена
  refresh: () =>
    api.post('/api/auth/refresh'),

  // Выход
  logout: () =>
    api.post('/api/auth/logout'),
};