import { api } from '../../../shared/api/client';

export interface RegisterPayload {
  username: string;
  email: string;
  password_hash: string;
}

export const authApi = {
  register: (data: RegisterPayload) => api.post('/register', data),
  login: (username: string, password_hash: string) =>
    api.post('/token', { username, password_hash }, { params: { grant_type: 'password' } }),
  refresh: (refresh_token: string) =>
    api.post('/token', { refresh_token }, { params: { grant_type: 'refresh_token' } }),
};