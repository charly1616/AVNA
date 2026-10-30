import { Navigate } from 'react-router';
import { useAuthStore } from '../store/auth.store.js';

/**
 * Guest guard: redirects authenticated users away from login/register pages.
 */
export function GuestGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestGuard;
