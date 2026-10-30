import { create } from 'zustand';
import { authApi } from '../api/auth.api.js';
import { queryClient } from '@/shared/api/queryClient.js';

/**
 * Auth session state. It owns session lifecycle only; API calls go through
 * authApi (shared transport). On logout or a global 401, the query cache is
 * cleared so no stale server state survives a session change.
 */
export const useAuthStore = create((set) => ({
  teacher: null,
  isAuthenticated: false,
  isLoading: true,

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      const { teacher } = await authApi.me();
      set({ teacher, isAuthenticated: Boolean(teacher), isLoading: false });
    } catch {
      set({ teacher: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async ({ name, password }) => {
    const { teacher } = await authApi.register(name, password);
    set({ teacher, isAuthenticated: true });
    return teacher;
  },

  login: async ({ name, password }) => {
    const { teacher } = await authApi.login(name, password);
    set({ teacher, isAuthenticated: true });
    return teacher;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ teacher: null, isAuthenticated: false });
      queryClient.clear();
    }
  },
}));

// Respond to global unauthorized events (e.g. cookie expired).
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      useAuthStore.setState({ teacher: null, isAuthenticated: false });
      queryClient.clear();
    }
  });
}

export default useAuthStore;
