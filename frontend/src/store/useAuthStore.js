import { create } from "zustand";
import authService from "../api/auth.service.js";

/**
 * Global auth state. Only three pieces of state exist (isAuthenticated,
 * teacher, isLoading) because the spec only needs Login/Register/Home.
 * This store handles initial session check (me) and auth:unauthorized events.
 */

export const useAuthStore = create((set) => ({
  teacher: null,
  isAuthenticated: false,
  isLoading: true, // true until we finish the initial /auth/me call

  setLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      const { teacher } = await authService.me();
      set({ teacher, isAuthenticated: Boolean(teacher), isLoading: false });
    } catch {
      set({ teacher: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async ({ name, password }) => {
    const { teacher } = await authService.register(name, password);
    set({ teacher, isAuthenticated: true });
    return teacher;
  },

  login: async ({ name, password }) => {
    const { teacher } = await authService.login(name, password);
    set({ teacher, isAuthenticated: true });
    return teacher;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ teacher: null, isAuthenticated: false });
    }
  },
}));

// Respond to global unauthorized events (e.g. cookie expired)
if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      useAuthStore.setState({ teacher: null, isAuthenticated: false });
    }
  });
}

export default useAuthStore;