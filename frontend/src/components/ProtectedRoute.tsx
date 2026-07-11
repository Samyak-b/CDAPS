import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ requiredRole }: { requiredRole?: 'admin' | 'citizen' }) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to={requiredRole === 'citizen' ? "/citizen/login" : "/login"} replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect role mismatch
    return <Navigate to={user.role === 'admin' ? "/dashboard" : "/citizen"} replace />;
  }

  return <Outlet />;
};
