import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Подставляем access_token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gbc_access');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 — попытка refresh
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('gbc_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/token`,
            { refresh_token: refresh },
            { params: { grant_type: 'refresh_token' } }
          );
          localStorage.setItem('gbc_access', data.access_token);
          localStorage.setItem('gbc_refresh', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);