import { useAuthStore } from '../store/auth.store.js';

/**
 * Convenience hook over the auth store. Components should prefer this so the
 * store surface stays in one place.
 */
export function useAuth() {
  return {
    teacher: useAuthStore((state) => state.teacher),
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
    isLoading: useAuthStore((state) => state.isLoading),
    login: useAuthStore((state) => state.login),
    logout: useAuthStore((state) => state.logout),
    register: useAuthStore((state) => state.register),
    checkAuth: useAuthStore((state) => state.checkAuth),
  };
}

export default useAuth;
