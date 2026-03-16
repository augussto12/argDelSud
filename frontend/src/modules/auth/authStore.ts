import { create } from 'zustand';
import type { User } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const api = (await import('../../shared/api/client')).default;
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const api = (await import('../../shared/api/client')).default;
      const res = await api.get('/auth/me');
      set({ user: res.data.user, token });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
