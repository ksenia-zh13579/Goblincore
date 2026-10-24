import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gbc_access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/api/auth/refresh')
    ) {
      original._retry = true;

      try {
        const { data } = await api.post<{ accessToken: string }>('/api/auth/refresh');
        localStorage.setItem('gbc_access', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('gbc_user');
        localStorage.removeItem('gbc_access');
        localStorage.removeItem('gbc_refresh');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
