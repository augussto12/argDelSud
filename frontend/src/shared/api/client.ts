import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 segundos — evita requests colgados
});

// Interceptor: agrega token de auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja 401 (token expirado) y 403 (usuario desactivado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (status === 403 && !isLoginRequest) {
      // Usuario desactivado — el backend ahora verifica activo en cada request
      const message = error.response?.data?.message || '';
      if (message.includes('desactivado')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

