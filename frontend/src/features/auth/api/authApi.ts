import { api } from '../../../shared/api/client';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};
