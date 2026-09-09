import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FB] dark:bg-[#0F1115] text-[#1E6FF0]">
        <div className="w-8 h-8 border-3 border-[#1E6FF0] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB]">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
