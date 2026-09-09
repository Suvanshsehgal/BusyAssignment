import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { AccessDeniedPage } from '../pages/AccessDeniedPage.jsx';

/**
 * RoleRoute enforces role-based access control (RBAC).
 * - If session is loading, renders centered loading spinner.
 * - If unauthenticated, redirects to /login with state: { from: location }.
 * - If authenticated but user role is not in allowedRoles, renders AccessDeniedPage.
 * - If authenticated and permitted, renders Outlet (or children).
 */
export const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FB] dark:bg-[#0F1115] text-[#1E6FF0]">
        <div className="w-8 h-8 border-3 border-[#1E6FF0] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-medium text-[#4A4A4A] dark:text-[#AEB2BB]">
          Verifying permissions...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = user?.role;
  const isAuthorized = Array.isArray(allowedRoles)
    ? allowedRoles.includes(userRole)
    : userRole === allowedRoles;

  if (!isAuthorized) {
    return <AccessDeniedPage requiredRole={allowedRoles} />;
  }

  return children ? children : <Outlet />;
};
