import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gbc_access');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
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
      !original.url?.endsWith('/auth/refresh')
    ) {
      original._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('gbc_access', data.accessToken);
        original.headers.Authorization = 'Bearer ' + data.accessToken;
        return api(original);
      } catch {
        localStorage.removeItem('gbc_user');
        localStorage.removeItem('gbc_access');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
