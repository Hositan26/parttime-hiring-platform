import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { hasAnyRole, safeReturnPath } from '../../services/authPolicy';

// Protects private screens using current account details returned by the server.
export const RoleRoute = ({ roles = [], children }: { roles?: string[]; children?: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status">Đang kiểm tra đăng nhập...</p>;
  if (!user) return <Navigate replace to={'/login?returnTo=' +
    encodeURIComponent(safeReturnPath(location.pathname + location.search))} />;
  if (roles.length && !hasAnyRole(user.roles, roles)) return <Navigate replace to="/jobs" />;
  return children ?? <Outlet />;
};
